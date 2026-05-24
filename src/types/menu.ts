export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  featured: boolean;
  spicyLevel: 'none' | 'low' | 'medium' | 'high';
  veg: boolean;
  createdAt: any;
  updatedAt: any;
  
  // Deprecated/Legacy fields for compatibility
  imageUrl?: string;
  isSoldOut?: boolean;
  isRecommended?: boolean;
  addOns?: string[];
}
