export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export interface Product {
  id: string;
  userId: string;
  storeId: string;
  shopeeId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  sold: number;
  images: string[];
  status: ProductStatus;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  storeId: string;
  shopeeId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
}
