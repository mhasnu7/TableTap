import { Session, OrderStatus } from '@/types/session'
import OrderCard from './OrderCard'
import { sessionService } from '@/services/sessionService'

export default function KanbanBoard({ sessions, restaurantId }: { sessions: Session[], restaurantId: string }) {
  
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, sessionId: string) => {
    await sessionService.updateOrderStatus(restaurantId, sessionId, orderId, status)
  }

  const allOrders = sessions.flatMap(session => 
    session.orders.map(order => ({ ...order, tableId: session.tableId, sessionId: session.id }))
  )

  const columns: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready']

  return (
    <div className="flex gap-4 p-4 min-h-screen bg-gray-950 overflow-x-auto">
      {columns.map(status => (
        <div key={status} className="w-80 flex-shrink-0 bg-gray-900 rounded-xl p-4 h-full">
          <h2 className="text-xl font-bold text-white capitalize mb-4">{status}</h2>
          <div className="space-y-4">
            {allOrders.filter(o => o.status === status).map(order => (
              <OrderCard 
                key={order.orderId} 
                order={order} 
                tableId={order.tableId}
                onUpdateStatus={(orderId, status) => handleUpdateStatus(orderId, status, order.sessionId)} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
