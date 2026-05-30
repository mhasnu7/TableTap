'use client'

import { sessionService } from '@/services/sessionService'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useCart } from '@/context/CartContext'
import { FoodCard } from '@/components/FoodCard'
import { CategoryChips } from '@/components/CategoryChips'
import { FloatingCart } from '@/components/FloatingCart'
import { CheckoutModal } from '@/components/CheckoutModal'
import { SessionDisplay } from '@/components/SessionTimer'
import { OrderSuccess } from '@/components/OrderSuccess'
import { subscribeToMenu } from '@/services/menuService'
import { restaurantService } from '@/services/restaurantService'
import { MenuItem } from '@/types/menu'
import { createOrder } from '@/services/orderService'

export default function RestaurantMenuPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = Array.isArray(params.restaurantId) ? params.restaurantId[0] : params.restaurantId
  const { items, clearCart } = useCart()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [table, setTable] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeSession, setActiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  
  useEffect(() => {
    if (!restaurantId || !params.tableId) return

    async function initSession(restaurantData: any) {
        let session = await sessionService.getActiveSession(restaurantId as string, params.tableId as string)
        if (!session) {
             const mode = restaurantData.paymentSettings?.defaultPaymentMode?.toUpperCase() || 'PREPAID'
             await sessionService.createEmptySession(restaurantId as string, params.tableId as string, mode)
             session = await sessionService.getActiveSession(restaurantId as string, params.tableId as string)
        }
        setActiveSession(session)
    }

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
      initSession(data)
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
      className="min-h-screen pb-24 -mt-12 sm:-mt-16 relative z-0 rounded-t-3xl shadow-2xl bg-background mx-auto max-w-4xl" 
      style={{
        '--primary': restaurant?.themeColor || '#f97316',
        '--color-primary': restaurant?.themeColor || '#f97316',
        backgroundImage: restaurant?.backgroundImage ? `url(${restaurant.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      } as React.CSSProperties}
    >
      <header className="relative h-[300px] sm:h-[350px] overflow-hidden group">
        {restaurant?.banner ? (
          <img 
            src={restaurant.banner} 
            alt={restaurant?.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">No Banner Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 w-full">
          <div className="flex items-end gap-4 relative z-10">
            {restaurant?.logo ? (
              <img 
                src={restaurant.logo} 
                alt={restaurant?.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background shadow-xl -mb-12 sm:-mb-16"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary border-4 border-background shadow-xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-primary-foreground -mb-12 sm:-mb-16">
                  {restaurant?.name?.charAt(0) || 'R'}
              </div>
            )}
            <div className="flex-grow mb-2 sm:mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">{restaurant?.name || 'Restaurant'}</h1>
              <p className="text-white/90 text-sm sm:text-base font-medium mt-1">{restaurant?.cuisineType || 'Cuisine'}</p>
              {restaurant?.tags && restaurant.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {restaurant.tags.map((tag: string) => (
                    <span key={tag} className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {activeSession && (
          <div className="mb-6 space-y-4">
            <SessionDisplay session={activeSession} />
            <div className="flex gap-2">
                <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium" disabled={activeSession.status === 'BILL_REQUESTED'}>Order More</button>
                <button 
                    disabled={activeSession.status === 'BILL_REQUESTED'}
                    className={`flex-1 ${activeSession.status === 'BILL_REQUESTED' ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 rounded-lg font-medium`} 
                    onClick={async () => {
                    await sessionService.updateSessionStatus(restaurantId as string, activeSession.id, 'BILL_REQUESTED', 'unpaid', true)
                }}>Request Bill</button>
                <button className="flex-1 bg-amber-600 text-white py-2 rounded-lg font-medium" disabled={activeSession.status === 'BILL_REQUESTED'}>Call Waiter</button>
            </div>
          </div>
        )}
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

      <FloatingCart onCheckout={async () => {
        if (activeSession?.paymentMode === 'POSTPAID') {
          try {
            const orderItemsForOrder = items.map(item => ({
                menuItemId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const orderItemsForSession = items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }));
            
            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const orderId = await createOrder({
                restaurantId: restaurantId as string,
                tableId: params.tableId as string,
                items: orderItemsForOrder,
                totalAmount: totalAmount,
                paymentMode: 'table', 
                customerName: 'Customer',
                status: 'PENDING',
                paymentStatus: 'unpaid'
            });
            
            await sessionService.appendOrderToSession(activeSession.id, restaurantId as string, {
                items: orderItemsForSession,
                total: totalAmount
            });
            
            setOrderId(orderId);
            clearCart();
          } catch (e) {
            console.error(e);
          }
        } else {
          setIsCheckoutOpen(true);
        }
      }} />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={(id) => setOrderId(id)}
        restaurant={restaurant}
        activeSession={activeSession}
      />
    </main>
  )
}
