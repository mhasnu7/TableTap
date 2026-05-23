import StatusBadge from "@/components/StatusBadge"
import { useState, useEffect } from "react"
import { updateOrderStatus, Order } from "@/services/orderService"

export default function OrderCard({ order }: { order: Order }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date().getTime()
      const createdAt = order.createdAt.toDate()
      const diff = Math.floor((now - createdAt.getTime()) / 1000 / 60)
      setElapsed(diff)
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 60000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  const updateStatus = async (status: Order["status"]) => {
    try {
      await updateOrderStatus(order.restaurantId, order.id, status)
    } catch (error) {
      console.error("Failed to update order status:", error)
      // Optionally, show a toast notification for the error
    }
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Table {order.tableId}</h3>
          <p className="text-card-foreground/70">Elapsed: {elapsed} mins</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="space-y-2 mb-4">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-card-foreground">
            <span>{item.name} x {item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="text-sm text-card-foreground/70 mb-2">
        Payment Mode: {order.paymentMode || 'N/A'}
      </div>

      {order.specialInstructions && (
        <p className="text-sm text-card-foreground/60 italic mb-4">Note: {order.specialInstructions}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <button onClick={() => updateStatus('preparing')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Accept</button>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => updateStatus('ready')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Ready</button>
        )}
        {order.status === 'ready' && (
          <button onClick={() => updateStatus('served')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Served</button>
        )}
        {order.status === 'served' && (
          <button onClick={() => updateStatus('completed')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Complete</button>
        )}
      </div>
    </div>
  )
}
