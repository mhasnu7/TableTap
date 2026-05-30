'use client'

import { useRestaurant } from '@/context/RestaurantContext';
import Image from 'next/image';

export function RestaurantBranding({ className = '' }: { className?: string }) {
  const { restaurant } = useRestaurant();

  if (!restaurant) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {restaurant.logo ? (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image 
            src={restaurant.logo} 
            alt={restaurant.name} 
            width={40} 
            height={40} 
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {restaurant.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h2 className="font-bold text-lg leading-tight">{restaurant.name}</h2>
        <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
      </div>
    </div>
  );
}
