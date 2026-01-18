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
  workspaceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Customer Types
export interface Customer {
  clientId: string;
  name: string;
  workspaceId: string;
  email: string;
  contactNumber?: string;
  countryCode?: number | null;
  companyName?: string;
  billingAddress?: string;
  taxId?: string;
  createdAt?: string;
  totalSpent: number;
  subscriptions: number;
}

export interface PaginationPayload {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateCustomerRequest {
  workspaceId: string;
  name: string;
  email: string;
  contactNumber?: string;
  countryCode?: number | null;
  billingAddress?: string;
  companyName?: string;
  taxId?: string;
}

// Product Types
export interface Product {
  workspaceId: string;
  productId: string;
  name: string;
  description: string;
  price: any;
  currency: string;
  active: boolean;
  createdAt: string;
  productCategory: string;
  image?: string;
}

export interface CreateProductRequest {
  workspaceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  active: boolean;
  productCategory: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  active?: boolean;
  category?: string;
}

// Tax Types
export interface Tax {
  id: string;
  name: string;
  rate: number; // Percentage (e.g., 18 for 18%)
  description?: string;
  active: boolean;
  createdAt: string;
}

// Subscription Types
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "paused";
export type SubscriptionInterval = "day" | "week" | "month" | "year";

export interface SubscriptionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
  taxName?: string;
  taxRate?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  // Legacy single product fields (kept for backward compatibility)
  productId?: string;
  productName?: string;
  // New multi-product support
  items: SubscriptionItem[];
  status: SubscriptionStatus;
  amount: number; // Total amount
  subtotal: number; // Before tax
  taxTotal: number; // Total tax
  currency: string;
  intervalCount: number; // e.g., 2 for "every 2 weeks"
  interval: SubscriptionInterval;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
  canceledAt?: string;
}

// Invoice Types
export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

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
  taxId?: string;
  taxName?: string;
  taxRate?: number;
  taxAmount?: number;
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
