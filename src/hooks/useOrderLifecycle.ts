import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Session, OrderStatus } from '../types/session';
import { sessionService } from '../services/sessionService';

export const useOrderLifecycle = (restaurantId: string, sessionId: string) => {
  const [orders, setOrders] = useState<Session['orders']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!restaurantId || !sessionId) {
      setLoading(false);
      return;
    }

    const sessionRef = doc(db, `restaurants/${restaurantId}/sessions/${sessionId}`);

    const unsubscribe = onSnapshot(
      sessionRef,
      (doc) => {
        if (doc.exists()) {
          const sessionData = doc.data() as Session;
          setOrders(sessionData.orders);
        } else {
          setOrders([]);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurantId, sessionId]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await sessionService.updateOrderStatus(restaurantId, sessionId, orderId, newStatus);
    } catch (err) {
      setError(err as Error);
    }
  };

  return { orders, loading, error, updateOrderStatus };
};
