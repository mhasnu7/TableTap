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
import { Session, OrderItem, PaymentStatus, OrderStatus, SessionOrder, SessionStatus } from '../types/session'

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

  async createEmptySession(restaurantId: string, tableId: string, paymentMode: 'PREPAID' | 'POSTPAID') {
    const newSession: Partial<Session> = {
      restaurantId,
      tableId,
      status: 'ACTIVE',
      paymentMode,
      orders: [],
      subtotal: 0,
      taxes: 0,
      total: 0,
      paymentStatus: 'unpaid',
      isActive: true,
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      sessionDurationMinutes: 0 // Not used anymore
    }
    
    return await addDoc(collection(db, `restaurants/${restaurantId}/sessions`), newSession)
  },

  async createSession(restaurantId: string, tableId: string, order: { items: OrderItem[], total: number }) {
    const newSession: Omit<Session, 'id'> = {
      restaurantId,
      tableId,
      status: 'ACTIVE',
      orders: [{
        orderId: Date.now().toString(),
        items: order.items,
        total: order.total,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      subtotal: order.total,
      taxes: order.total * 0.1, // Simple tax logic
      total: order.total * 1.1,
      paymentStatus: 'unpaid',
      isActive: true,
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      sessionDurationMinutes: 0
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
          status: 'PENDING',
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
          updatedAt: new Date(),
          lastActivity: new Date()
        })
    })
  },

  async updateOrderStatus(restaurantId: string, sessionId: string, orderId: string, status: OrderStatus) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    
    await runTransaction(db, async (transaction) => {
        const sessionDoc = await transaction.get(sessionRef)
        const sessionData = sessionDoc.data() as Session
        
        if (status === 'SESSION_CLOSED') {
            transaction.update(sessionRef, {
              status: 'CLOSED',
              isActive: false,
              endTime: new Date(),
              updatedAt: new Date()
            })
            // Release table
            const tableRef = doc(db, `restaurants/${restaurantId}/tables/${sessionData.tableId}`)
            transaction.update(tableRef, { status: 'AVAILABLE' })
        } else {
            const updatedOrders = sessionData.orders.map(order => 
                order.orderId === orderId ? { ...order, status, updatedAt: new Date() } : order
            )
            
            transaction.update(sessionRef, {
                orders: updatedOrders,
                updatedAt: new Date(),
                lastActivity: new Date()
            })
        }
    })
  },

  async closeSession(restaurantId: string, sessionId: string, tableId: string) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    await updateDoc(sessionRef, {
      status: 'CLOSED',
      isActive: false,
      endTime: new Date(),
      updatedAt: new Date()
    })
    
    // Release table
    const tableRef = doc(db, `restaurants/${restaurantId}/tables/${tableId}`)
    await updateDoc(tableRef, { status: 'AVAILABLE' })
  },

  async updateSessionStatus(restaurantId: string, sessionId: string, status: SessionStatus, paymentStatus: PaymentStatus, isActive: boolean) {
    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`)
    const updateData: any = {
      status,
      paymentStatus,
      isActive,
      updatedAt: new Date(),
      lastActivity: new Date()
    }
    if (status === 'CLOSED') {
      updateData.endTime = new Date()
      // Release table (assuming we have tableId from somewhere, maybe fetch session first)
      const sessionDoc = await getDoc(sessionRef)
      const sessionData = sessionDoc.data() as Session
      const tableRef = doc(db, `restaurants/${restaurantId}/tables/${sessionData.tableId}`)
      await updateDoc(tableRef, { status: 'AVAILABLE' })
    }
    await updateDoc(sessionRef, updateData)
  },

  async cleanupExpiredSessions(restaurantId: string) {
    // No longer needed
  }
}
