'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeToOrders, Order } from '@/services/orderService'
import KitchenBoard from '@/components/kitchen/KitchenBoard'

export default function KitchenDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!user?.restaurantId) return

    console.log('DEBUG: Setting up kitchen orders listener for', user.restaurantId)
    
    const unsubscribe = subscribeToOrders(user.restaurantId, (allOrders) => {
      console.log('DEBUG: Received snapshot updates for kitchen orders')
      const filteredOrders = allOrders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status))
      setOrders(filteredOrders)
    })

    return () => unsubscribe()
  }, [user?.restaurantId])

  if (!user?.restaurantId) return <div className="p-4 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <h2 className="text-2xl font-bold text-white p-4">Kitchen Dashboard</h2>
      {orders.length === 0 ? (
        <div className="flex-1 flex justify-center items-center text-gray-500 text-xl">Kitchen is clear</div>
      ) : (
        <KitchenBoard orders={orders} restaurantId={user.restaurantId} />
      )}
    </div>
  )
}
