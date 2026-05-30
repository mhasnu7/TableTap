'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Restaurant } from '@/types/restaurant';
import { restaurantService } from '@/services/restaurantService';
import { useAuth } from '@/context/AuthContext';

interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  loading: true,
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.restaurantId) {
      const unsubscribe = restaurantService.subscribeToRestaurant(user.restaurantId, (data) => {
        setRestaurant(data);
        setLoading(false);
        if (data?.themeColor) {
          document.documentElement.style.setProperty('--primary', data.themeColor);
        }
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user?.restaurantId]);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => useContext(RestaurantContext);
