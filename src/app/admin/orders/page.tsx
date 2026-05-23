
'use client'
import { useEffect, useState, useRef } from 'react'
import OrderCard from '@/components/dashboard/OrderCard'
import OrderSkeleton from '@/components/dashboard/OrderSkeleton'
import { useAuth } from '@/context/AuthContext'
import { subscribeToOrders, Order, updateOrderStatus } from '@/services/orderService'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.restaurantId) return

    console.log("DEBUG: Setting up orders listener for", user.restaurantId)
    const unsubscribe = subscribeToOrders(user.restaurantId, (fetchedOrders) => {
      const sortedOrders = fetchedOrders.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      setOrders(sortedOrders)
      setLoading(false)
    })

    // Auto-scroll logic: scroll to top on new orders (optional, could be removed if not desired for admin)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }

    // Sound alert (simple browser beep if possible, or just play a file) - Consider if this is needed for admin
    // new Audio('/alert.mp3').play().catch(() => {})

    return () => unsubscribe()
  }, [user?.restaurantId])

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto p-4 bg-gray-50">
      <h2 className="text-4xl font-bold mb-8">Live Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <OrderSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <div className="col-span-full flex justify-center items-center h-64 text-gray-500 text-xl border-2 border-dashed border-gray-200 rounded-xl">
            No active orders
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}
