import { Session, OrderStatus } from '@/types/session'
import OrderCard from './OrderCard'
import { sessionService } from '@/services/sessionService'
import { Order } from '@/services/orderService'
import { Timestamp } from 'firebase/firestore'

export default function KanbanBoard({ sessions, restaurantId }: { sessions: Session[], restaurantId: string }) {
  
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, sessionId: string) => {
    await sessionService.updateOrderStatus(restaurantId, sessionId, orderId, status)
  }

  const allOrders: Order[] = sessions.flatMap(session => 
    session.orders.map(order => ({
      id: order.orderId,
      customerName: 'Customer',
      tableId: session.tableId,
      restaurantId: restaurantId,
      paymentMode: 'prepaid' as const,
      paymentStatus: 'unpaid' as const,
      status: order.status as Order['status'],
      createdAt: Timestamp.fromDate(new Date(order.createdAt)),
      specialInstructions: '',
      totalAmount: order.total,
      items: order.items.map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    }))
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
                key={order.id} 
                order={order} 
                restaurantId={restaurantId}
                onUpdateStatus={async (orderId: string, status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled') => {
                  const session = sessions.find(s => s.orders.some(o => o.orderId === orderId))
                  if (session) {
                    await handleUpdateStatus(orderId, status as OrderStatus, session.id)
                  }
                }} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
