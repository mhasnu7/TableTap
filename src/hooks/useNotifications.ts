import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types/notification';

export const useNotifications = (restaurantId: string, orderId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, `restaurants/${restaurantId}/notifications`),
      where('orderId', '==', orderId)
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(data);
    });
  }, [restaurantId, orderId]);

  return notifications;
};
