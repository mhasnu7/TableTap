export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isSoldOut?: boolean;
  isRecommended?: boolean;
  addOns?: string[];
}
