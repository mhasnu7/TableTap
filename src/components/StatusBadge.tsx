'use client'
import { motion } from 'framer-motion'

export default function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50',
    preparing: 'bg-blue-500/20 text-blue-500 border border-blue-500/50',
    served: 'bg-green-500/20 text-green-500 border border-green-500/50',
    completed: 'bg-gray-500/20 text-gray-500 border border-gray-500/50',
  }
  
  const style = colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-500 border border-gray-500/50'

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  )
}
