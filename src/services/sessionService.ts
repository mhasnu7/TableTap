import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  serverTimestamp,
  getDoc,
  runTransaction
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Session, OrderItem, PaymentStatus, OrderStatus, SessionOrder } from '../types/session'

export const sessionService = {
  async getActiveSession(restaurantId: string, tableId: string): Promise<Session | null> {
    const sessionsRef = collection(db, `restaurants/${restaurantId}/sessions`)
    const q = query(sessionsRef, where('tableId', '==', tableId), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) return null
    
    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Session
  },

  async getActiveSessionsForRestaurant(restaurantId: string): Promise<Session[]> {
    const sessionsRef = collection(db, `restaurants/${restaurantId}/sessions`)
    const q = query(sessionsRef, where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session))
  },

  async createSession(restaurantId: string, tableId: string, order: { items: OrderItem[], total: number }) {
    const newSession = {
      restaurantId,
      tableId,
      orders: [{
        orderId: Date.now().toString(),
        items: order.items,
        total: order.total,
        status: 'pending' as OrderStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      subtotal: order.total,
      taxes: order.total * 0.1, // Simple tax logic
      total: order.total * 1.1,
      paymentStatus: 'unpaid' as PaymentStatus,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return await addDoc(collection(db, `restaurants/${restaurantId}/sessions`), newSession)
  },

  async appendOrderToSession(sessionId: string, restaurantId: string, order: { items: OrderItem[], total: number }) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    
    await runTransaction(db, async (transaction) => {
        const sessionDoc = await transaction.get(sessionRef)
        const sessionData = sessionDoc.data() as Session
        
        const newOrder: SessionOrder = {
          orderId: Date.now().toString(),
          items: order.items,
          total: order.total,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const newSubtotal = sessionData.subtotal + order.total
        const newTaxes = newSubtotal * 0.1
        const newTotal = newSubtotal + newTaxes

        transaction.update(sessionRef, {
          orders: arrayUnion(newOrder),
          subtotal: newSubtotal,
          taxes: newTaxes,
          total: newTotal,
          updatedAt: new Date()
        })
    })
  },

  async updateOrderStatus(restaurantId: string, sessionId: string, orderId: string, status: OrderStatus) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    
    await runTransaction(db, async (transaction) => {
        const sessionDoc = await transaction.get(sessionRef)
        const sessionData = sessionDoc.data() as Session
        
        const updatedOrders = sessionData.orders.map(order => 
            order.orderId === orderId ? { ...order, status, updatedAt: new Date() } : order
        )
        
        transaction.update(sessionRef, {
            orders: updatedOrders,
            updatedAt: new Date()
        })
    })
  },

  async updateSessionStatus(restaurantId: string, sessionId: string, status: PaymentStatus, isActive: boolean) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    await updateDoc(sessionRef, {
      paymentStatus: status,
      isActive: isActive,
      updatedAt: new Date()
    })
  }
}
