export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerName: string;
  status: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RevenueByDay {
  date: string;
  total: number;
  orderCount: number;
}
