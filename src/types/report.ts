export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: ReportType;
  storeIds: string[];
  startDate: Date;
  endDate: Date;
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  totalChats?: number;
  conversionRate?: number;
  data?: Record<string, any>;
  fileUrl?: string;
  createdAt: Date;
}
