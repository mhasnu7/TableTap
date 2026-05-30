export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'cashier' | 'owner';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  pin: string;
  role: UserRole;
  restaurantId: string;
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
  assignedTables?: string[];
}
