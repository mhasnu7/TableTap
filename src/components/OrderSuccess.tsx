'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderSuccessProps {
  orderId: string
  restaurantId: string
  onClose: () => void
}

export function OrderSuccess({ orderId, restaurantId, onClose }: OrderSuccessProps) {
  const router = useRouter()
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
        
        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            Continue Ordering
          </button>
        </div>
      </motion.div>
    </div>
  )
}
