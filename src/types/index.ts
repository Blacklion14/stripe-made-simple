// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  totalSpent: number;
  subscriptions: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  active: boolean;
  createdAt: string;
  category: string;
  image?: string;
}

// Subscription Types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
  canceledAt?: string;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionName?: string;
  productId?: string;
  productName?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  totalCustomers: number;
  activeSubscriptions: number;
  pendingInvoices: number;
  revenueGrowth: number;
  customerGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
