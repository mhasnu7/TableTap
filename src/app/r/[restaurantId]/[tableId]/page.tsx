'use client'

import { useState, useEffect } from 'react'
import { getMenu } from '@/services/menuService'
import { FoodCard } from '@/components/FoodCard'
import { CategoryChips } from '@/components/CategoryChips'
import { FloatingCart } from '@/components/FloatingCart'
import { CheckoutModal } from '@/components/CheckoutModal'
import { OrderSuccess } from '@/components/OrderSuccess'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { sessionService } from '@/services/sessionService'

export default function RestaurantPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const tableId = params.tableId as string
  
  const { setActiveSession, activeSession } = useCart()
  
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const data = await getMenu(restaurantId)
      setMenu(data)
      
      const session = await sessionService.getActiveSession(restaurantId, tableId)
      if (session) {
        setActiveSession(session)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [restaurantId, tableId, setActiveSession])

  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category || 'General')))]
  const filteredMenu = selectedCategory === 'All' ? menu : menu.filter(item => (item.category || 'General') === selectedCategory)
  const recommendedItems = menu.filter(item => item.isRecommended).slice(0, 3)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">LOGO</div>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Restaurant Name</h1>
                <p className="text-foreground/70">Table {tableId}</p>
            </div>
          </div>
          {activeSession && (
            <div className="mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium inline-block">
              Existing session found: {activeSession.orders.length} orders
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {recommendedItems.length > 0 && (
            <>
                <h2 className="text-xl font-bold text-foreground mb-4">Recommended for you</h2>
                <div className="grid gap-4 mb-8">
                    {recommendedItems.map((item: any) => (
                        <FoodCard key={item.id} item={item} />
                    ))}
                </div>
            </>
        )}
        
        <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        
        <motion.div 
          layout
          className="grid gap-4 mt-6"
        >
          {filteredMenu.map((item: any) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>

      <FloatingCart onCheckout={() => setIsCheckoutOpen(true)} />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={(id) => setOrderId(id)}
      />
      
      {orderId && (
        <OrderSuccess 
          orderId={orderId} 
          onClose={() => setOrderId(null)} 
        />
      )}
    </main>
  )
}
