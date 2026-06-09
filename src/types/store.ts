export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface ShopeeConnectionData {
  id: string;
  shopId: number;
  shopName: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  shopeeId: string;
  shopeeShopId: number | null;
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
  shopeeConnections?: ShopeeConnectionData[];
}

export interface CreateStoreRequest {
  name: string;
  shopeeId: string;
  apiKey: string;
  apiSecret: string;
}
