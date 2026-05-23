'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Table } from '@/types/table'
import { Session } from '@/types/session'
import TableGrid from '@/components/staff/TableGrid'
import BillingPanel from '@/components/staff/BillingPanel'
import StaffOrderCard from '@/components/staff/StaffOrderCard'
import { subscribeToOrders, Order } from '@/services/orderService'
import { Users, CreditCard, ShoppingBag, LayoutGrid } from 'lucide-react'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // Subscribe to tables
  useEffect(() => {
    if (!user?.restaurantId) return

    const tablesRef = collection(db, `restaurants/${user.restaurantId}/tables`)
    const unsubscribe = onSnapshot(tablesRef, (snapshot) => {
      const tablesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table))
      setTables(tablesData)
    })

    return () => unsubscribe()
  }, [user?.restaurantId])

  // Subscribe to selected table's active session
  useEffect(() => {
    if (!user?.restaurantId || !selectedTable) return

    const sessionsRef = collection(db, `restaurants/${user.restaurantId}/sessions`)
    const q = query(sessionsRef, where('tableId', '==', selectedTable.id), where('isActive', '==', true))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveSession({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Session)
      } else {
        setActiveSession(null)
      }
    })

    return () => unsubscribe()
  }, [user?.restaurantId, selectedTable])

  // Subscribe to active orders
  useEffect(() => {
    if (!user?.restaurantId) return

    const unsubscribe = subscribeToOrders(user.restaurantId, (allOrders) => {
      // Filter orders to only show active ones (not completed)
      const active = allOrders.filter(o => 
        ['pending', 'accepted', 'preparing', 'ready', 'served'].includes(o.status)
      )
      setOrders(active)
    })

    return () => unsubscribe()
  }, [user?.restaurantId])

  const activeTablesCount = tables.filter(t => t.status === 'occupied').length
  const pendingBillsCount = tables.filter(t => t.status === 'billing').length
  const activeOrdersCount = orders.length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Staff Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time floor monitoring and order management.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tables</span>
            <p className="text-3xl font-black text-white mt-1">{activeTablesCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Bills</span>
            <p className="text-3xl font-black text-white mt-1">{pendingBillsCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Orders</span>
            <p className="text-3xl font-black text-white mt-1">{activeOrdersCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Tables and Active Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Columns: Tables & Orders */}
        <div className="xl:col-span-2 space-y-10">
          {/* Tables Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={18} className="text-gray-400" />
              <h3 className="text-xl font-bold text-white">Tables Overview</h3>
            </div>
            <TableGrid tables={tables} onSelectTable={setSelectedTable} />
          </div>
          
          {/* Active Orders Section */}
          <div className="border-t border-gray-800/60 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag size={18} className="text-gray-400" />
              <h3 className="text-xl font-bold text-white">Active Orders</h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full font-medium">
                {activeOrdersCount} Live
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-gray-900/20 border border-gray-850 rounded-2xl p-12 text-center">
                <p className="text-gray-500 italic text-sm">No active orders right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <StaffOrderCard 
                    key={order.id} 
                    order={order} 
                    restaurantId={user!.restaurantId} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Billing Panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <BillingPanel 
              session={activeSession} 
              onClose={() => setSelectedTable(null)} 
              restaurantId={user!.restaurantId}
              tableId={selectedTable?.id || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
