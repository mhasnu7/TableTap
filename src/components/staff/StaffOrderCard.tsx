'use client'
import { Order, updateOrderStatus } from '@/services/orderService'
import { useState, useEffect } from 'react'
import { Clock, Check, CheckCircle2, ShoppingBag } from 'lucide-react'

interface StaffOrderCardProps {
  order: Order
  restaurantId: string
}

const statusColors: Record<string, { bg: string, text: string, label: string }> = {
  pending: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Pending' },
  accepted: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: 'Accepted' },
  preparing: { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400', label: 'Preparing' },
  ready: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Ready' },
  served: { bg: 'bg-teal-500/10 border-teal-500/20', text: 'text-teal-400', label: 'Served' },
  completed: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', label: 'Completed' },
}

export default function StaffOrderCard({ order, restaurantId }: StaffOrderCardProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date().getTime()
      const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date()
      const diff = Math.floor((now - createdAt.getTime()) / 1000 / 60)
      setElapsed(diff)
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 60000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  const handleUpdateStatus = async (newStatus: string) => {
    await updateOrderStatus(restaurantId, order.id, newStatus)
  }

  const statusStyle = statusColors[order.status] || { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-400', label: order.status }

  return (
    <div className="bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between hover:border-gray-700/80 transition-all duration-300">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Table {order.tableId}</span>
            <h4 className="text-lg font-bold text-gray-100 mt-0.5">{order.customerName || 'Guest'}</h4>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Time elapsed */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Clock size={14} className="text-gray-500" />
          <span>{elapsed} {elapsed === 1 ? 'min' : 'mins'} ago</span>
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4 border-t border-gray-800/80 pt-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-300 font-medium">
                {item.name} <span className="text-gray-500 text-xs ml-1">x{item.quantity}</span>
              </span>
              <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800/80 pt-3 mt-auto">
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-500">Total Amount</span>
          <span className="text-base font-bold text-white">${order.totalAmount.toFixed(2)}</span>
        </div>

        {order.specialInstructions && (
          <div className="bg-gray-950/40 border border-gray-800/55 rounded-lg p-2.5 mb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block mb-0.5">Special Request</span>
            <p className="text-xs text-gray-300 italic">"{order.specialInstructions}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {order.status === 'ready' && (
            <button
              onClick={() => handleUpdateStatus('served')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/20"
            >
              <ShoppingBag size={15} />
              Mark as Served
            </button>
          )}
          {order.status === 'served' && (
            <button
              onClick={() => handleUpdateStatus('completed')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-950/20"
            >
              <CheckCircle2 size={15} />
              Complete Order
            </button>
          )}
          {['pending', 'accepted', 'preparing'].includes(order.status) && (
            <div className="w-full bg-gray-950/30 border border-gray-800/50 py-2 px-3 rounded-xl text-xs text-center text-gray-500 italic">
              Kitchen is preparing this order
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
