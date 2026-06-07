export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateOrderRequest {
  storeId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
