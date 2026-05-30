'use client'
import { motion } from 'framer-motion'

export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50',
    ACCEPTED: 'bg-blue-500/20 text-blue-500 border border-blue-500/50',
    PREPARING: 'bg-purple-500/20 text-purple-500 border border-purple-500/50',
    READY: 'bg-orange-500/20 text-orange-500 border border-orange-500/50',
    SERVED: 'bg-green-500/20 text-green-500 border border-green-500/50',
    BILL_GENERATED: 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/50',
    PAID: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50',
    SESSION_CLOSED: 'bg-gray-500/20 text-gray-500 border border-gray-500/50',
    cancelled: 'bg-red-500/20 text-red-500 border border-red-500/50',
    completed: 'bg-gray-500/20 text-gray-500 border border-gray-500/50',
  }
  
  const style = colors[status] || 'bg-gray-500/20 text-gray-500 border border-gray-500/50'

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {status}
    </motion.span>
  )
}
