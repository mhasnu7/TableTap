'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface OrderSuccessProps {
  orderId: string
  onClose: () => void
}

export function OrderSuccess({ orderId, onClose }: OrderSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-3xl font-bold mt-4">Order Placed!</h2>
        <p className="text-gray-600 mt-2">Order ID: {orderId}</p>
        <p className="text-gray-600 mt-1">Estimated preparation: 15-20 mins</p>
        
        <button 
          onClick={onClose}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Continue Ordering
        </button>
      </motion.div>
    </div>
  )
}
