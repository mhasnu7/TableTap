export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  addOns?: string[]
  notes?: string
}

export type PaymentStatus = 'unpaid' | 'paid' | 'partially paid'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed'

export interface SessionOrder {
  orderId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  restaurantId: string
  tableId: string
  orders: SessionOrder[]
  subtotal: number
  taxes: number
  total: number
  paymentStatus: PaymentStatus
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
