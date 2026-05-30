import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Table } from '../types/table'

export const tableService = {
  async getTables(restaurantId: string): Promise<Table[]> {
    const tablesRef = collection(db, `restaurants/${restaurantId}/tables`)
    const q = query(tablesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Table))
  },

  async addTable(restaurantId: string, tableData: Omit<Table, 'id' | 'createdAt' | 'restaurantId' | 'qrUrl'>) {
    const tablesRef = collection(db, `restaurants/${restaurantId}/tables`)
    const newTable = {
      ...tableData,
      restaurantId,
      qrUrl: '', // Will be updated after creation with the ID
      createdAt: serverTimestamp()
    }
    
    const docRef = await addDoc(tablesRef, newTable)
    
    // Update with QR URL
    const qrUrl = `/r/${restaurantId}/${docRef.id}`
    await updateDoc(docRef, { qrUrl })
    
    return docRef.id
  },

  async updateTable(restaurantId: string, tableId: string, updateData: Partial<Table>) {
    const tableRef = doc(db, `restaurants/${restaurantId}/tables/${tableId}`)
    await updateDoc(tableRef, updateData)
  },

  async deleteTable(restaurantId: string, tableId: string) {
    const tableRef = doc(db, `restaurants/${restaurantId}/tables/${tableId}`)
    await deleteDoc(tableRef)
  },

  async setTableActiveStatus(restaurantId: string, tableId: string, active: boolean) {
    const tableRef = doc(db, `restaurants/${restaurantId}/tables/${tableId}`)
    await updateDoc(tableRef, { active })
  },

  async assignWaiterToTable(restaurantId: string, tableId: string, waiterId: string | null) {
    const tableRef = doc(db, `restaurants/${restaurantId}/tables/${tableId}`)
    await updateDoc(tableRef, { assignedWaiterId: waiterId })
  }
}
