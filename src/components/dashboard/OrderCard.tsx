import StatusBadge from "@/components/StatusBadge"
import { useState, useEffect } from "react"
import { updateOrderStatus, updateOrderPaymentStatus, Order } from "@/services/orderService"

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

  const updateStatus = async (status: string) => {
    try {
      await updateOrderStatus(order.restaurantId, order.id, status)
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const verifyPayment = async () => {
    try {
      await updateOrderPaymentStatus(order.restaurantId, order.id, 'paid')
    } catch (error) {
      console.error("Failed to verify payment:", error)
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
      
      {order.paymentStatus && (
        <div className={`text-sm mb-2 ${order.paymentStatus === 'pending_verification' ? 'text-yellow-600' : order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
            Payment Status: {order.paymentStatus}
        </div>
      )}

      {order.specialInstructions && (
        <p className="text-sm text-card-foreground/60 italic mb-4">Note: {order.specialInstructions}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {order.status === 'PENDING' && (
          <button onClick={() => updateStatus('ACCEPTED')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Accept</button>
        )}
        {order.status === 'ACCEPTED' && (
          <button onClick={() => updateStatus('PREPARING')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Prepare</button>
        )}
        {order.status === 'PREPARING' && (
          <button onClick={() => updateStatus('READY')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Ready</button>
        )}
        {order.status === 'READY' && (
          <button onClick={() => updateStatus('SERVED')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Served</button>
        )}
        {order.status === 'SERVED' && (
          <button onClick={() => updateStatus('BILL_GENERATED')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Generate Bill</button>
        )}
        {order.status === 'BILL_GENERATED' && (
          <button onClick={() => updateStatus('PAID')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Paid</button>
        )}
        {order.status === 'PAID' && (
          <button onClick={() => updateStatus('SESSION_CLOSED')} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Close Session</button>
        )}
        <button onClick={() => updateStatus('cancelled')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Cancel</button>
      </div>
    </div>
  )
}
