
export enum OrderStatus {
  CREATED = 'Created',
  IN_SHOP = 'In Shop',
  READY_TO_PICKUP = 'Ready to Pick Up',
  CUSTOMER_RECEIVED = 'Customer Received',
  COMPLETED = 'Completed'
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid'
}

export interface OrderItem {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerPin: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  history: OrderHistoryEntry[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: 'customer' | 'admin' | 'staff' | 'viewer';
  createdAt: string;
}

export interface AdminLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  details: string;
  orderId?: string;
}

// Added Language and Theme types
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
