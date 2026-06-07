export const APP_NAME = 'Shopee Monitor Pro';
export const MAX_STORES = 10;

export const ORDER_STATUSES = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  DELIVERED: 'Terima',
  CANCELLED: 'Dibatalkan',
  RETURNED: 'Dikembalikan',
};

export const PAYMENT_STATUSES = {
  PENDING: 'Menunggu',
  COMPLETED: 'Lunas',
  FAILED: 'Gagal',
  REFUNDED: 'Dikembalikan',
};

export const STORE_STATUSES = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  SUSPENDED: 'Ditangguhkan',
  PENDING: 'Menunggu',
};

export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'Pesanan Baru',
  NEW_CHAT: 'Chat Baru',
  LOW_STOCK: 'Stok Menipis',
  RATING_DROP: 'Rating Turun',
  STORE_OFFLINE: 'Toko Offline',
  PAYMENT_RECEIVED: 'Pembayaran Diterima',
};
