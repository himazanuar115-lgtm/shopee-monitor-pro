export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  NEW_CHAT = 'NEW_CHAT',
  LOW_STOCK = 'LOW_STOCK',
  RATING_DROP = 'RATING_DROP',
  STORE_OFFLINE = 'STORE_OFFLINE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
}

export interface Notification {
  id: string;
  userId: string;
  storeId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}
