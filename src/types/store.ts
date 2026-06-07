export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  shopeeId: string;
  status: StoreStatus;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalChats: number;
  totalVisitors: number;
  conversionRate: number;
  isConnected: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreRequest {
  name: string;
  shopeeId: string;
  apiKey: string;
  apiSecret: string;
}
