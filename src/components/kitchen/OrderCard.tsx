import { Order, updateOrderStatus } from '@/services/orderService'
import { useState, useEffect } from 'react'
import { OrderStatus } from '@/types/session'

export default function OrderCard({ 
  order, 
  restaurantId,
  onUpdateStatus,
}: { 
  order: Order, 
  restaurantId: string,
  onUpdateStatus?: (orderId: string, status: OrderStatus) => Promise<void>
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      // @ts-ignore
      const diff = Math.floor((now - order.createdAt.toDate().getTime()) / 1000 / 60)
      setElapsed(diff)
    }, 60000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(order.id, newStatus)
    } else {
      await updateOrderStatus(restaurantId, order.id, newStatus)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-white">Table {order.tableId} - {order.customerName}</h3>
        <span className="text-sm text-gray-400">{elapsed} min ago</span>
      </div>
      
      <div className="space-y-1 mb-4 text-gray-200">
        <p className="text-sm">Payment: {order.paymentMode}</p>
        <p className="text-sm font-semibold">Total: ${order.totalAmount.toFixed(2)}</p>
        {order.specialInstructions && <p className="text-sm italic text-gray-400">Note: {order.specialInstructions}</p>}
        <div className="border-t border-gray-700 pt-2 mt-2">
            {order.items.map((item, index) => (
            <div key={index} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
            </div>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {order.status === 'ACCEPTED' && (
          <button onClick={() => handleUpdateStatus('PREPARING')} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">Start Preparing</button>
        )}
        {order.status === 'PREPARING' && (
          <button onClick={() => handleUpdateStatus('READY')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm">Mark Ready</button>
        )}
      </div>
    </div>
  )
}
