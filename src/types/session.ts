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
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'BILL_GENERATED' | 'PAID' | 'SESSION_CLOSED' | 'cancelled' | 'completed'

export interface SessionOrder {
  orderId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export type SessionStatus = 'ACTIVE' | 'BILL_REQUESTED' | 'BILL_GENERATED' | 'PAYMENT_RECEIVED' | 'CLOSED'
export type PaymentMode = 'PREPAID' | 'POSTPAID'

export interface Session {
  id: string
  restaurantId: string
  tableId: string
  status: SessionStatus
  paymentMode: PaymentMode
  orders: SessionOrder[]
  subtotal: number
  taxes: number
  total: number
  paymentStatus: PaymentStatus
  customerName?: string
  customerPhone?: string
  isActive: boolean
  lastActivity: Date
  startTime: Date
  endTime?: Date
  createdAt: Date
  updatedAt: Date
  sessionDurationMinutes: number
}
