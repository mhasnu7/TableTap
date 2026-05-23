import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  tableId: string;
  restaurantId: string;
  paymentMode: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed';
  createdAt: Timestamp;
  specialInstructions?: string;
  totalAmount: number;
  items: OrderItem[];
}

export const createOrder = async (orderData: Omit<Order, 'createdAt' | 'status'>) => {
  try {
    const orderRef = collection(db, 'restaurants', orderData.restaurantId, 'orders');
    const docRef = await addDoc(orderRef, {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    console.log('Order created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const subscribeToOrders = (restaurantId: string, callback: (orders: any[]) => void) => {
  const q = query(collection(db, 'restaurants', restaurantId, 'orders'));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders);
  });
};

export const updateOrderStatus = async (restaurantId: string, orderId: string, newStatus: string) => {
  try {
    const orderRef = doc(db, 'restaurants', restaurantId, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
    console.log(`Order ${orderId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
