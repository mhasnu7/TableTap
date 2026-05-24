import { Order } from '@/services/orderService'
import OrderCard from './OrderCard'

export default function KitchenBoard({ orders, restaurantId }: { orders: Order[], restaurantId: string }) {
  const columns = ['pending', 'preparing', 'ready', 'completed']

  return (
    <div className="flex gap-4 p-4 min-h-screen bg-gray-950 overflow-x-auto">
      {columns.map(status => (
        <div key={status} className="w-80 flex-shrink-0 bg-gray-900 rounded-xl p-4 h-full">
          <h2 className="text-xl font-bold text-white capitalize mb-4">{status}</h2>
          <div className="space-y-4">
            {orders.filter(o => o.status === status || (status === 'pending' && o.status === 'accepted')).map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                restaurantId={restaurantId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
