'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { updateOrderStatus, Order } from '@/services/orderService'
import { OrderStatus } from '@/types/session'
import AnalyticsCard from '@/components/dashboard/AnalyticsCard'
import OrderSkeleton from '@/components/dashboard/OrderSkeleton'
import { useToast } from '@/context/ToastContext'
import { Clock, LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'PENDING' | 'completed' | 'all'>('active')
  
  const { user } = useAuth()
  const { showToast } = useToast()
  const restaurantId = user?.restaurantId

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false)
      return
    }

    setLoading(true)
    // Firestore query path strictly restaurants/{restaurantId}/orders
    const qOrders = query(collection(db, `restaurants/${restaurantId}/orders`))

    const unsubscribe = onSnapshot(
      qOrders,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        // Sort orders by timestamp descending
        const sortedDocs = docs.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt as any) || 0
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt as any) || 0
          return timeB - timeA
        })

        setOrders(sortedDocs)
        setError(null)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore listener error:', err)
        setError('Failed to fetch real-time orders data.')
        setLoading(false)
        showToast('Error loading live orders!')
      }
    )

    return () => unsubscribe()
  }, [restaurantId, showToast])

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    if (!restaurantId) return
    try {
      await updateOrderStatus(restaurantId, orderId, status)
      showToast(`Order status updated to ${status}!`)
    } catch (err) {
      console.error('Failed to update status:', err)
      showToast('Failed to update order status.')
    }
  }

  // Date Helpers
  const getOrderDate = (o: any) => {
    if (o.createdAt?.toDate) return o.createdAt.toDate()
    if (o.createdAt?.seconds) return new Date(o.createdAt.seconds * 1000)
    return new Date(o.createdAt || 0)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Metric Computations (computed automatically in realtime when order statuses change)
  const activeOrders = orders.filter(
    (o) => o.status && o.status !== 'completed' && o.status !== 'cancelled'
  )
  
  const totalActiveOrdersCount = activeOrders.length
  
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING'
  ).length

  // Occupied tables: count of unique table IDs containing at least one active order
  const occupiedTablesCount = Array.from(
    new Set(activeOrders.map((o) => o.tableId).filter(Boolean))
  ).length

  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status === 'completed') {
      const amount = o.totalAmount || 0
      return sum + amount
    }
    return sum
  }, 0)

  const completedOrdersTodayCount = orders.filter((o) => {
    if (o.status !== 'completed') return false
    const date = getOrderDate(o)
    return isToday(date)
  }).length

  // Filtering for live orders display
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true
    if (activeTab === 'completed') return o.status === 'completed'
    if (activeTab === 'PENDING') return o.status === 'PENDING'
    // 'active' tab: all statuses except completed and cancelled
    return o.status && o.status !== 'completed' && o.status !== 'cancelled'
  })

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
        <div className="mt-8">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 w-36 rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-gray-500 mb-4 font-semibold text-lg">No restaurant setup found.</div>
        <Link href="/setup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Complete Restaurant Setup
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-red-500 mb-4 font-semibold text-lg">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-indigo-600 dark:text-indigo-400" /> Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time control panel for restaurant operations
          </p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <AnalyticsCard title="Active Orders" value={totalActiveOrdersCount} />
        <AnalyticsCard title="Pending Orders" value={pendingOrdersCount} />
        <AnalyticsCard title="Occupied Tables" value={occupiedTablesCount} />
        <AnalyticsCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
        <AnalyticsCard title="Completed Today" value={completedOrdersTodayCount} />
      </div>

      {/* Live Order Section under requested header "Table Sessions" */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            Table Sessions
          </h3>
          
          {/* Tab Filters */}
          <div className="flex flex-wrap bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(['active', 'PENDING', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Live Order Cards Container */}
        {filteredOrders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700/80 p-16 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-full text-gray-400 dark:text-gray-500 mb-4">
              <Clock size={40} className="stroke-1" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">No orders found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              There are currently no {activeTab} orders for this restaurant.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredOrders.map((order) => (
              <AdminOrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminOrderCard({
  order,
  onUpdateStatus,
}: {
  order: Order
  onUpdateStatus: (orderId: string, status: Order['status']) => void
}) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date().getTime()
      let createdDate: Date
      if (order.createdAt?.toDate) {
        createdDate = order.createdAt.toDate()
      } else if (order.createdAt?.seconds) {
        createdDate = new Date(order.createdAt.seconds * 1000)
      } else {
        createdDate = new Date()
      }

      const diffMs = now - createdDate.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)

      if (diffMins < 1) {
        setElapsed('Just now')
      } else if (diffMins < 60) {
        setElapsed(`${diffMins}m ago`)
      } else {
        const hours = Math.floor(diffMins / 60)
        const mins = diffMins % 60
        setElapsed(`${hours}h ${mins}m ago`)
      }
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 30000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  const formattedTime = () => {
    let createdDate: Date
    if (order.createdAt?.toDate) {
      createdDate = order.createdAt.toDate()
    } else if (order.createdAt?.seconds) {
      createdDate = new Date(order.createdAt.seconds * 1000)
    } else {
      createdDate = new Date()
    }
    return createdDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50'
      case 'READY':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/50'
      case 'SERVED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
      <div>
        {/* Card Header: customer name & table ID */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-700/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-extrabold text-sm px-2.5 py-1 rounded-lg">
                Table {order.tableId}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-gray-800 dark:text-gray-100 font-bold text-base truncate max-w-[150px]">
              {order.customerName || 'Guest'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{formattedTime()}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">{elapsed}</p>
          </div>
        </div>

        {/* Items list with quantities */}
        <div className="py-4">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ordered Items</p>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span>
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-mono">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="mb-4 bg-amber-50/50 border border-amber-100 dark:bg-amber-950/25 dark:border-amber-900/30 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 italic flex gap-1.5">
            <span className="font-bold not-italic text-amber-900 dark:text-amber-200">Note:</span>
            <span>"{order.specialInstructions}"</span>
          </div>
        )}
      </div>

      <div>
        {/* Payment mode, order total, timestamps */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex justify-between items-center mb-5">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Payment Mode</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize mt-0.5">{order.paymentMode || 'cash'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Order Total</p>
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              ₹{(order.totalAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Status controls: pending → accepted → preparing → ready → completed */}
        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10"
            >
              Accept
            </button>
          )}
          {order.status === 'ACCEPTED' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
              className="flex-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/10"
            >
              Prepare
            </button>
          )}
          {order.status === 'PREPARING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'READY')}
              className="flex-1 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-lg shadow-purple-600/10"
            >
              Ready
            </button>
          )}
          {order.status === 'READY' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/10"
            >
              Complete
            </button>
          )}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="px-3 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
