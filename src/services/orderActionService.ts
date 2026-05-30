import { db } from '../lib/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sessionService } from './sessionService';

export const updateOrderStatusWithNotification = async (
  restaurantId: string,
  orderId: string,
  newStatus: string,
  sessionId?: string, // Optional because not all orders might be in a session
  note?: string
) => {
  try {
    // 1. Update order in 'orders' collection
    const orderRef = doc(db, 'restaurants', restaurantId, 'orders', orderId);
    const updateData: any = { status: newStatus };
    if (note) {
      updateData.specialInstructions = note; // Assuming this is how we add notes
    }
    await updateDoc(orderRef, updateData);

    // 2. Update order in 'sessions' collection if sessionId is provided
    if (sessionId) {
      await sessionService.updateOrderStatus(restaurantId, sessionId, orderId, newStatus as any);
    }

    // 3. Create notification
    await addDoc(collection(db, 'restaurants', restaurantId, 'notifications'), {
      orderId,
      status: newStatus,
      message: `Order ${orderId} is now ${newStatus}`,
      timestamp: serverTimestamp(),
      type: 'order_status_update'
    });

    console.log(`Order ${orderId} updated to ${newStatus} and notification sent.`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
