export type UserRole = 'admin' | 'waiter' | 'kitchen';

export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  restaurantId: string;
  active: boolean;
  createdAt: Date;
}
