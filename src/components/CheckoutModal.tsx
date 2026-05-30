'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/services/orderService'
import { useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { sessionService } from '@/services/sessionService'
import { formatCurrency } from '@/lib/formatters'
import { Restaurant } from '@/types/restaurant'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderId: string) => void
  restaurant: Restaurant | null
  activeSession: any
}

export function CheckoutModal({ isOpen, onClose, onSuccess, restaurant, activeSession }: CheckoutModalProps) {
  const { items, totalAmount, clearCart } = useCart()
  const { showToast } = useToast()
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const tableId = params.tableId as string

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [instructions, setInstructions] = useState('')
  
  const paymentSettings = restaurant?.paymentSettings || { paymentMode: 'both', upiId: '', paymentQr: '' }
  const initialPaymentChoice = paymentSettings.paymentMode === 'postpaid' ? 'counter' : 'prepaid';
  const [paymentChoice, setPaymentChoice] = useState<'prepaid' | 'counter' | 'table'>(initialPaymentChoice)
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePlaceOrder = async () => {
    console.log('Placing order with mode:', paymentChoice);
    if (!customerName.trim()) {
      showToast('Please enter your name')
      return
    }

    // Skip payment screen for postpaid modes
    if (paymentChoice !== 'prepaid') {
        await finalizeOrder('unpaid')
        return
    }

    if (paymentChoice === 'prepaid') {
        setShowPaymentScreen(true)
        return
    }

    await finalizeOrder()
  }

  const finalizeOrder = async (paymentStatus?: 'pending_verification' | 'paid' | 'unpaid') => {
    console.log('Finalizing order with status:', paymentStatus, 'and mode:', paymentChoice);
    setLoading(true)

    try {
        const orderItemsForOrder = items.map(item => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))

        const orderItemsForSession = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }))
        
        const orderId = await createOrder({
          restaurantId,
          tableId,
          customerName,
          customerPhone: customerPhone || undefined,
          items: orderItemsForOrder,
          totalAmount: totalAmount,
          paymentMode: paymentChoice,
          paymentStatus: paymentStatus || (paymentChoice === 'prepaid' ? 'unpaid' : 'unpaid'),
          specialInstructions: instructions,
        })
        
        if (paymentChoice !== 'prepaid' && activeSession) {
            await sessionService.appendOrderToSession(activeSession.id, restaurantId, {
                items: orderItemsForSession,
                total: totalAmount
            })
        }
        
        console.log('Order finalized successfully with ID:', orderId);

      clearCart()
      showToast('Order placed successfully!')
      onSuccess('ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      onClose()
    } catch (e) {
      showToast('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const upiLink = `upi://pay?pa=${paymentSettings.upiId}&pn=${restaurant?.name || 'Restaurant'}&am=${totalAmount}`

  const handleCancelOrder = () => {
    clearCart()
    onClose()
  }

  const handleClearCart = () => {
    clearCart()
    showToast('Cart cleared')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            
            {!showPaymentScreen ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Enter phone number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter phone number to receive order updates.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                  <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. No onions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                  <div className="flex gap-4 mt-1">
                    {['prepaid', 'both'].includes(paymentSettings.paymentMode || 'both') && (
                      <button 
                        onClick={() => setPaymentChoice('prepaid')}
                        className={`flex-1 py-2 rounded-md ${paymentChoice === 'prepaid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                      >Pay Now</button>
                    )}
                    {['postpaid', 'both'].includes(paymentSettings.paymentMode || 'both') && (
                        <>
                      <button 
                        onClick={() => setPaymentChoice('counter')}
                        className={`flex-1 py-2 rounded-md ${paymentChoice === 'counter' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                      >Counter</button>
                      <button 
                        onClick={() => setPaymentChoice('table')}
                        className={`flex-1 py-2 rounded-md ${paymentChoice === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                      >Table</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (paymentChoice === 'prepaid' ? `Continue - ${formatCurrency(totalAmount)}` : 'Place Order')}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleClearCart}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                    >
                      Clear Cart
                    </button>
                    <button 
                      onClick={handleCancelOrder}
                      className="flex-1 py-2 bg-red-100 text-red-700 rounded-xl font-semibold"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <h3 className="text-xl font-bold">Complete Payment</h3>
                <p className="text-gray-600">Scan QR or pay via UPI</p>
                <div className="bg-gray-100 p-4 rounded-xl">
                    {/* Placeholder for QR code */}
                    <p>QR Code</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="font-mono text-sm">{paymentSettings.upiId}</span>
                    <button className="text-blue-600 text-sm font-semibold">Copy</button>
                </div>
                <p className="font-bold text-lg">Total: {formatCurrency(totalAmount)}</p>
                
                <a href={upiLink} className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Pay Now</a>
                
                <button 
                    onClick={() => finalizeOrder('pending_verification')}
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'I Have Paid'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
