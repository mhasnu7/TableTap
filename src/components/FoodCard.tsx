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
      className={`bg-card rounded-3xl p-4 shadow-sm border border-border flex gap-4 overflow-hidden ${item.isSoldOut ? 'opacity-60' : ''}`}
    >
      <div className="w-24 h-24 rounded-2xl bg-border/50 flex-shrink-0 relative overflow-hidden">
        {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-border" /> 
        )}
        {item.isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">Sold Out</div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-card-foreground">{item.name}</h3>
        <p className="text-sm text-card-foreground/70 line-clamp-2">{item.description}</p>
        {item.addOns && item.addOns.length > 0 && (
            <p className="text-xs text-primary mt-1">+ Add-ons available</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="font-bold text-primary">₹{item.price}</p>
          
          {!item.isSoldOut && (
            cartItem ? (
              <div className="flex items-center bg-primary/10 rounded-xl px-2 py-1">
                <button onClick={() => removeItem(item.id)} className="p-1 text-primary">
                  <Minus size={16} />
                </button>
                <span className="px-2 font-semibold text-card-foreground">{cartItem.quantity}</span>
                <button onClick={() => { addItem(item); showToast('Added to cart'); }} className="p-1 text-primary">
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { addItem(item); showToast('Added to cart'); }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
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
