import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Restaurant } from '@/types/restaurant';

export const restaurantService = {
  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    const docRef = doc(db, 'restaurants', restaurantId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Restaurant;
    }
    return null;
  },
  subscribeToRestaurant(restaurantId: string, callback: (restaurant: Restaurant | null) => void) {
    const docRef = doc(db, 'restaurants', restaurantId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      } else {
        callback(null);
      }
    });
  },
  async updateRestaurant(restaurantId: string, data: Partial<Restaurant>) {
    const docRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(docRef, data);
  }
};
