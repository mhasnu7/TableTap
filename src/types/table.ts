export type TableStatus = 'available' | 'occupied' | 'billing' | 'cleaning'

export interface Table {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  active: boolean;
  status: TableStatus;
  qrUrl: string;
  createdAt: Date;
}
