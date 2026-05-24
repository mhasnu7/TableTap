export type NotificationType = 'order_received' | 'preparing' | 'ready';

export interface Notification {
  id: string;
  restaurantId: string;
  orderId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}
