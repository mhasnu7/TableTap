'use client'

import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { MenuItem } from '@/types/menu'

interface FoodCardProps {
  item: MenuItem
}

export function FoodCard({ item }: FoodCardProps) {
  const { addItem, removeItem, items } = useCart()
  const { showToast } = useToast()
  const cartItem = items.find((i) => i.id === item.id)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-card rounded-2xl p-5 shadow-sm border border-border flex gap-4 overflow-hidden ${item.isSoldOut ? 'opacity-60' : ''}`}
    >
      <div className="w-28 h-28 rounded-xl bg-border/50 flex-shrink-0 relative overflow-hidden">
        {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
            <div className="w-full h-full bg-border flex items-center justify-center text-border-foreground/50">
              <span className="text-4xl">🍽️</span>
            </div>
        )}
        {item.isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">Sold Out</div>
        )}
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div>
            <h3 className="font-semibold text-lg text-card-foreground leading-tight">{item.name}</h3>
            <p className="text-sm text-card-foreground/70 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="font-bold text-lg text-primary">₹{item.price}</p>
          
          {!item.isSoldOut && (
            cartItem ? (
              <div className="flex items-center bg-primary/10 rounded-full px-2 py-1">
                <button onClick={() => removeItem(item.id)} className="p-1 text-primary hover:bg-primary/20 rounded-full transition">
                  <Minus size={16} />
                </button>
                <span className="px-3 font-semibold text-card-foreground text-sm">{cartItem.quantity}</span>
                <button onClick={() => { addItem(item); showToast('Added to cart'); }} className="p-1 text-primary hover:bg-primary/20 rounded-full transition">
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { addItem(item); showToast('Added to cart'); }}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition active:scale-95"
              >
                Add
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  )
}
