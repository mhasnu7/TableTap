'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useCart } from '@/context/CartContext'
import { FoodCard } from '@/components/FoodCard'
import { CategoryChips } from '@/components/CategoryChips'
import { FloatingCart } from '@/components/FloatingCart'
import { CheckoutModal } from '@/components/CheckoutModal'
import { OrderSuccess } from '@/components/OrderSuccess'
import { subscribeToMenu } from '@/services/menuService'
import { restaurantService } from '@/services/restaurantService'
import { MenuItem } from '@/types/menu'
import { createOrder } from '@/services/orderService'

export default function RestaurantMenuPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = Array.isArray(params.restaurantId) ? params.restaurantId[0] : params.restaurantId
  const { items } = useCart()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [table, setTable] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    if (!restaurantId || !params.tableId) return

    async function fetchTable() {
      try {
        const tableRef = doc(db, 'restaurants', restaurantId as string, 'tables', params.tableId as string)
        const tableDoc = await getDoc(tableRef)
        if (tableDoc.exists()) setTable(tableDoc.data())
      } catch (err) {
        console.error('Error fetching table', err)
      }
    }
    fetchTable()

    const unsubscribeRestaurant = restaurantService.subscribeToRestaurant(restaurantId as string, (data) => {
      console.log('Restaurant data received:', data)
      setRestaurant(data)
    })

    const unsubscribeMenu = subscribeToMenu(restaurantId as string, (menu) => {
      console.log('Menu items received:', menu)
      const items = menu.filter(item => item.available)
      setMenuItems(items)
      if (items.length > 0 && !selectedCategory) {
        setSelectedCategory(items[0].category)
      }
      setLoading(false)
    })

    return () => {
      unsubscribeRestaurant()
      unsubscribeMenu()
    }
  }, [restaurantId, params.tableId])

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (orderId) return <OrderSuccess orderId={orderId} restaurantId={restaurantId as string} onClose={() => { setOrderId(null); router.refresh(); }} />

  // Group by category
  const categories = Array.from(new Set(menuItems.map(item => item.category)))
  
  return (
    <main 
      className="min-h-screen pb-24"
      style={{ 
        '--color-primary': restaurant?.themeColor || '#f97316',
        backgroundImage: restaurant?.backgroundImage ? `url(${restaurant.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      } as React.CSSProperties}
    >
      <header className="relative h-80 overflow-hidden">
        {restaurant?.banner ? (
          <img 
            src={restaurant.banner} 
            alt={restaurant?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <div className="flex items-center gap-4">
            {restaurant?.logo ? (
              <img 
                src={restaurant.logo} 
                alt={restaurant?.name}
                className="w-20 h-20 rounded-2xl border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary border-4 border-background shadow-lg flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {restaurant?.name?.charAt(0) || 'R'}
              </div>
            )}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-white tracking-tight">{restaurant?.name || 'Restaurant'}</h1>
              <p className="text-white/90 text-sm font-medium bg-black/20 px-2 py-0.5 rounded inline-block mt-1">{restaurant?.cuisineType || 'Cuisine'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {restaurant?.restaurantDescription && (
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{restaurant.restaurantDescription}</p>
        )}
        
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 px-4 py-3 mb-6 border-b border-border">
            <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <section className="grid gap-6">
            {menuItems.filter(i => i.category === selectedCategory).map((item) => (
                <FoodCard key={item.id} item={item} />
            ))}
        </section>
      </div>

      <FloatingCart onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={(id) => setOrderId(id)}
        restaurant={restaurant}
      />
    </main>
  )
}
