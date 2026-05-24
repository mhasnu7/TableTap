'use client'
import { Session } from '@/types/session'
import { tableService } from '@/services/tableService'
import { X, CreditCard, CheckCircle } from 'lucide-react'

interface BillingPanelProps {
  session: Session | null
  onClose: () => void
  restaurantId: string
  tableId: string
}

export default function BillingPanel({ session, onClose, restaurantId, tableId }: BillingPanelProps) {
  if (!session) return (
    <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-gray-850 text-gray-400 text-center italic shadow-xl">
      Select a table to view billing
    </div>
  )

  const handleUpdateStatus = async (status: 'billing' | 'available' | 'cleaning') => {
    await tableService.updateTable(restaurantId, tableId, { status })
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Billing Panel</span>
          <h2 className="text-xl font-bold text-gray-100">Table {tableId}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800/60 rounded-full transition-all"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-3 mb-6">
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">Orders Summary</span>
        {session.orders.map((order, idx) => (
          <div key={order.orderId || idx} className="flex justify-between text-sm bg-gray-950/30 border border-gray-850 rounded-xl p-3">
            <div>
              <span className="text-gray-300 font-medium block">Order #{idx + 1}</span>
              <span className="text-xs text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
            <span className="text-gray-200 font-semibold">${order.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-800/80 pt-4 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-gray-400 text-sm">Grand Total</span>
          <span className="text-2xl font-black text-white">${session.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          <span>Payment Status: <strong className="text-gray-400 capitalize">{session.paymentStatus}</strong></span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button 
          onClick={() => handleUpdateStatus('billing')}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/20"
        >
          <CreditCard size={16} />
          Bill Requested
        </button>
        <button 
          onClick={() => handleUpdateStatus('cleaning')}
          className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/20"
        >
          <X size={16} />
          Request Cleanup
        </button>
        <button 
          onClick={() => handleUpdateStatus('available')}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/20"
        >
          <CheckCircle size={16} />
          Close & Clean Table
        </button>
      </div>
    </div>
  )
}
