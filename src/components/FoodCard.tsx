'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { MenuItem } from '@/types/menu'

interface FoodCardProps {
  item: MenuItem
}

export function FoodCard({ item }: FoodCardProps) {
  const { addItem, removeItem, items, activeSession } = useCart()
  const { showToast } = useToast()
  const cartItem = items.find((i) => i.id === item.id)
  
  const isBillRequested = activeSession?.status === 'BILL_REQUESTED'

  const isPopular = item.featured || item.isRecommended
  const imageSrc = item.image || item.imageUrl

  return (
    <motion.div
      whileHover={{ y: isBillRequested ? 0 : -4, scale: isBillRequested ? 1 : 1.01 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-3xl p-4 shadow-md hover:shadow-xl border border-border/60 flex gap-4 relative overflow-hidden transition-all ${item.isSoldOut || isBillRequested ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Premium Food Image Section */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-muted flex-shrink-0 relative overflow-hidden shadow-inner group">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy" 
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center text-border-foreground/50">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {item.isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
            Sold Out
          </div>
        )}
        {isPopular && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full z-10 shadow flex items-center gap-0.5">
            <Star size={8} className="fill-current" /> Popular
          </span>
        )}
      </div>

      {/* Info & CTA Section */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-card-foreground leading-tight tracking-tight">
              {item.name}
            </h3>
            {item.veg !== undefined && (
              <div 
                className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm flex-shrink-0 mt-0.5 ${item.veg ? 'border-green-600' : 'border-red-600'}`}
                title={item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`} />
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-card-foreground/70 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-end justify-between mt-3">
          <p className="font-extrabold text-xl text-primary tracking-tight">
            ₹{item.price}
          </p>
          
          {!item.isSoldOut && (
            <div className="h-9 min-w-[80px] flex items-center justify-end">
              <AnimatePresence mode="wait">
                {cartItem ? (
                  <motion.div 
                    key="stepper"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center bg-primary text-primary-foreground rounded-full p-1 shadow-md"
                  >
                    <motion.button 
                      whileTap={{ scale: isBillRequested ? 1 : 0.85 }}
                      disabled={isBillRequested}
                      onClick={() => removeItem(item.id)} 
                      className={`p-1 ${isBillRequested ? 'opacity-50' : 'hover:bg-white/20'} rounded-full transition-colors`}
                    >
                      <Minus size={14} className="stroke-[2.5]" />
                    </motion.button>
                    <motion.span 
                      key={cartItem.quantity}
                      initial={{ y: -4, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-2.5 font-bold text-sm min-w-[20px] text-center"
                    >
                      {cartItem.quantity}
                    </motion.span>
                    <motion.button 
                      whileTap={{ scale: isBillRequested ? 1 : 0.85 }}
                      disabled={isBillRequested}
                      onClick={() => { addItem(item); showToast('Added to cart'); }} 
                      className={`p-1 ${isBillRequested ? 'opacity-50' : 'hover:bg-white/20'} rounded-full transition-colors`}
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="add-btn"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    whileTap={{ scale: isBillRequested ? 1 : 0.95 }}
                    disabled={isBillRequested}
                    onClick={() => { addItem(item); showToast('Added to cart'); }}
                    className={`bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-sm font-bold shadow hover:shadow-md hover:bg-primary/95 transition-all duration-200 ${isBillRequested ? 'opacity-50' : ''}`}
                  >
                    Add
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
