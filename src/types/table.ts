export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILL_REQUESTED' | 'PAYMENT_PENDING' | 'CLEANING'

export interface Table {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  active: boolean;
  status: TableStatus;
  qrUrl: string;
  createdAt: Date;
  assignedWaiterId?: string;
}
