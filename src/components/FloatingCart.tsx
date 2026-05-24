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
          className="fixed bottom-6 left-4 right-4 bg-foreground text-background p-4 rounded-3xl shadow-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-full text-primary-foreground">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{totalItems} Item{totalItems > 1 ? 's' : ''}</p>
              <p className="text-xs opacity-75">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <button onClick={onCheckout} className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm active:scale-95 transition">
            View Cart
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
