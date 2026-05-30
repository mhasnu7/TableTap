'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

export function FloatingCart({ onCheckout }: { onCheckout: () => void }) {
  const { totalAmount, totalItems, activeSession } = useCart()

  if (activeSession?.status === 'BILL_REQUESTED') {
      return (
         <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] bg-slate-900/95 text-white p-4 rounded-[28px] shadow-2xl backdrop-blur-md border border-white/10 flex items-center justify-center z-50">
            <span className="font-bold">Bill Requested</span>
         </div>
      )
  }

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] bg-slate-900/95 text-white p-4 rounded-[28px] shadow-2xl backdrop-blur-md border border-white/10 flex items-center justify-between z-50"
        >
          {/* Item count & Price Info */}
          <div className="flex items-center gap-3.5 pl-1">
            <motion.div 
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg"
            >
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </motion.div>
            <div>
              <p className="font-extrabold text-base leading-none">
                {totalItems} Item{totalItems > 1 ? 's' : ''}
              </p>
              <p className="text-sm font-medium text-white/70 mt-1">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Checkout CTA */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckout} 
            className="bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all"
          >
            <span>{activeSession?.paymentMode === 'POSTPAID' ? 'Place Order' : 'Proceed to Checkout'}</span>
            <ArrowRight size={16} className="stroke-[3]" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
