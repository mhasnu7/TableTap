'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

export function FloatingCart({ onCheckout }: { onCheckout: () => void }) {
  const { totalAmount, totalItems } = useCart()

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-4 left-4 right-4 bg-gray-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-full">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="font-bold">{totalItems} Item{totalItems > 1 ? 's' : ''}</p>
              <p className="text-sm opacity-80">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <button onClick={onCheckout} className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold">
            Checkout
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
