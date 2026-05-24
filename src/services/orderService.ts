import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
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
  customerPhone?: string;
  tableId: string;
  restaurantId: string;
  paymentMode: 'prepaid' | 'postpaid';
  paymentStatus?: 'pending_verification' | 'paid' | 'unpaid';
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  specialInstructions?: string;
  totalAmount: number;
  items: OrderItem[];
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'> & { status?: Order['status'] }) => {
  try {
    const orderRef = collection(db, 'restaurants', orderData.restaurantId, 'orders');
    const docRef = await addDoc(orderRef, {
      ...orderData,
      customerPhone: orderData.customerPhone ?? "",
      specialInstructions: orderData.specialInstructions ?? "",
      status: orderData.status ?? 'pending',
      paymentStatus: orderData.paymentStatus ?? 'unpaid',
      createdAt: serverTimestamp(),
    });
    
    // Update the document to include its own ID
    await updateDoc(docRef, { id: docRef.id });
    
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

export const updateOrderPaymentStatus = async (restaurantId: string, orderId: string, paymentStatus: 'paid' | 'unpaid') => {
  try {
    const orderRef = doc(db, 'restaurants', restaurantId, 'orders', orderId);
    await updateDoc(orderRef, { paymentStatus });
    console.log(`Order ${orderId} payment status updated to ${paymentStatus}`);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
};
