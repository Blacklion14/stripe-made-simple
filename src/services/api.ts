/**
 * Centralized API Service
 *
 * This file contains all API endpoints, schemas, and mock responses.
 * When connecting to a real backend, simply replace the mock implementations
 * with actual API calls using the same function signatures.
 */

import type {
  User,
  Customer,
  Product,
  Subscription,
  SubscriptionItem,
  Invoice,
  DashboardStats,
  ChartData,
  ApiResponse,
  PaginatedResponse,
  CreateCustomerRequest,
  CreateProductRequest,
  Tax,
} from "@/types";

// =============================================================================
// API Configuration
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Simulated API delay for realistic UX
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// Mock Data
// =============================================================================

const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    emailVerified: true,
    createdAt: "2024-01-15T10:30:00Z",
  },
];

const mockCustomers: Customer[] = [
  {
    workspaceId: "ws_main",
    clientId: "cus_1",
    name: "Acme Corp",
    email: "billing@acme.com",
    contactNumber: "+1 555-0100",
    billingAddress: "123 Business Ave, NY",
    createdAt: "2024-01-10T08:00:00Z",
    totalSpent: 15000,
    subscriptions: 2,
  },
  {
    workspaceId: "ws_main",
    clientId: "cus_2",
    name: "TechStart Inc",
    email: "finance@techstart.io",
    contactNumber: "+1 555-0101",
    billingAddress: "456 Tech Blvd, SF",
    createdAt: "2024-01-12T09:30:00Z",
    totalSpent: 8500,
    subscriptions: 1,
  },
  {
    workspaceId: "ws_main",
    clientId: "cus_3",
    name: "Global Solutions",
    email: "accounts@globalsol.com",
    contactNumber: "+1 555-0102",
    billingAddress: "789 Enterprise St, LA",
    createdAt: "2024-01-15T14:00:00Z",
    totalSpent: 25000,
    subscriptions: 3,
  },
  {
    workspaceId: "ws_main",
    clientId: "cus_4",
    name: "StartupXYZ",
    email: "hello@startupxyz.com",
    contactNumber: "+1 555-0103",
    billingAddress: "321 Innovation Way, Austin",
    createdAt: "2024-02-01T11:00:00Z",
    totalSpent: 3200,
    subscriptions: 1,
  },
  {
    workspaceId: "ws_main",
    clientId: "cus_5",
    name: "Enterprise Ltd",
    email: "billing@enterprise.co",
    contactNumber: "+1 555-0104",
    billingAddress: "555 Corporate Plaza, Chicago",
    createdAt: "2024-02-10T16:00:00Z",
    totalSpent: 45000,
    subscriptions: 5,
  },
];

const mockProducts: Product[] = [
  {
    workspaceId: "",
    productId: "prod_1",
    name: "Starter Plan",
    description: "Perfect for small teams getting started",
    price: 29,
    currency: "USD",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    productCategory: "Subscription",
  },
  {
    workspaceId: "",
    productId: "prod_2",
    name: "Professional Plan",
    description: "For growing businesses with advanced needs",
    price: 99,
    currency: "USD",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    productCategory: "Subscription",
  },
  {
    workspaceId: "",
    productId: "prod_3",
    name: "Enterprise Plan",
    description: "Full-featured solution for large organizations",
    price: 299,
    currency: "USD",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    productCategory: "Subscription",
  },
  {
    workspaceId: "",
    productId: "prod_4",
    name: "API Access",
    description: "Programmatic access to all features",
    price: 49,
    currency: "USD",
    active: true,
    createdAt: "2024-01-05T00:00:00Z",
    productCategory: "Add-on",
  },
  {
    workspaceId: "",
    productId: "prod_5",
    name: "Priority Support",
    description: "24/7 dedicated support channel",
    price: 199,
    currency: "USD",
    active: false,
    createdAt: "2024-01-10T00:00:00Z",
    productCategory: "Add-on",
  },
];

// Mock Taxes
const mockTaxes: Tax[] = [
  {
    id: "tax_1",
    name: "GST",
    rate: 18,
    description: "Goods and Services Tax",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tax_2",
    name: "VAT",
    rate: 20,
    description: "Value Added Tax",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tax_3",
    name: "Sales Tax",
    rate: 8.5,
    description: "State Sales Tax",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tax_4",
    name: "No Tax",
    rate: 0,
    description: "Tax exempt",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: "sub_1",
    customerId: "cus_1",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    productId: "prod_2",
    productName: "Professional Plan",
    items: [
      {
        id: "si_1",
        productId: "prod_2",
        productName: "Professional Plan",
        quantity: 1,
        unitPrice: 99,
        taxId: "tax_1",
        taxName: "GST",
        taxRate: 18,
        subtotal: 99,
        taxAmount: 17.82,
        total: 116.82,
      },
    ],
    status: "active",
    amount: 116.82,
    subtotal: 99,
    taxTotal: 17.82,
    currency: "USD",
    intervalCount: 1,
    interval: "month",
    startDate: "2024-06-01T00:00:00Z",
    currentPeriodStart: "2024-12-01T00:00:00Z",
    currentPeriodEnd: "2025-01-01T00:00:00Z",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "sub_2",
    customerId: "cus_1",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    productId: "prod_4",
    productName: "API Access + Pro Plan",
    items: [
      {
        id: "si_2",
        productId: "prod_4",
        productName: "API Access",
        quantity: 1,
        unitPrice: 49,
        taxId: "tax_1",
        taxName: "GST",
        taxRate: 18,
        subtotal: 49,
        taxAmount: 8.82,
        total: 57.82,
      },
      {
        id: "si_3",
        productId: "prod_2",
        productName: "Professional Plan",
        quantity: 2,
        unitPrice: 99,
        taxId: "tax_1",
        taxName: "GST",
        taxRate: 18,
        subtotal: 198,
        taxAmount: 35.64,
        total: 233.64,
      },
    ],
    status: "active",
    amount: 291.46,
    subtotal: 247,
    taxTotal: 44.46,
    currency: "USD",
    intervalCount: 1,
    interval: "month",
    startDate: "2024-07-15T00:00:00Z",
    currentPeriodStart: "2024-12-01T00:00:00Z",
    currentPeriodEnd: "2025-01-01T00:00:00Z",
    createdAt: "2024-07-15T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "sub_3",
    customerId: "cus_2",
    customerName: "TechStart Inc",
    customerEmail: "finance@techstart.io",
    productId: "prod_1",
    productName: "Starter Plan",
    items: [
      {
        id: "si_4",
        productId: "prod_1",
        productName: "Starter Plan",
        quantity: 1,
        unitPrice: 29,
        subtotal: 29,
        taxAmount: 0,
        total: 29,
      },
    ],
    status: "active",
    amount: 29,
    subtotal: 29,
    taxTotal: 0,
    currency: "USD",
    intervalCount: 2,
    interval: "week",
    startDate: "2024-03-05T00:00:00Z",
    currentPeriodStart: "2024-12-05T00:00:00Z",
    currentPeriodEnd: "2024-12-19T00:00:00Z",
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2024-12-05T00:00:00Z",
  },
  {
    id: "sub_4",
    customerId: "cus_3",
    customerName: "Global Solutions",
    customerEmail: "accounts@globalsol.com",
    productId: "prod_3",
    productName: "Enterprise Plan",
    items: [
      {
        id: "si_5",
        productId: "prod_3",
        productName: "Enterprise Plan",
        quantity: 5,
        unitPrice: 299,
        taxId: "tax_2",
        taxName: "VAT",
        taxRate: 20,
        subtotal: 1495,
        taxAmount: 299,
        total: 1794,
      },
    ],
    status: "active",
    amount: 1794,
    subtotal: 1495,
    taxTotal: 299,
    currency: "USD",
    intervalCount: 1,
    interval: "month",
    startDate: "2024-01-20T00:00:00Z",
    currentPeriodStart: "2024-12-10T00:00:00Z",
    currentPeriodEnd: "2025-01-10T00:00:00Z",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
  },
  {
    id: "sub_5",
    customerId: "cus_4",
    customerName: "StartupXYZ",
    customerEmail: "hello@startupxyz.com",
    productId: "prod_1",
    productName: "Starter Plan",
    items: [
      {
        id: "si_6",
        productId: "prod_1",
        productName: "Starter Plan",
        quantity: 1,
        unitPrice: 29,
        subtotal: 29,
        taxAmount: 0,
        total: 29,
      },
    ],
    status: "past_due",
    amount: 29,
    subtotal: 29,
    taxTotal: 0,
    currency: "USD",
    intervalCount: 1,
    interval: "month",
    startDate: "2024-08-15T00:00:00Z",
    currentPeriodStart: "2024-11-15T00:00:00Z",
    currentPeriodEnd: "2024-12-15T00:00:00Z",
    createdAt: "2024-08-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
  },
  {
    id: "sub_6",
    customerId: "cus_5",
    customerName: "Enterprise Ltd",
    customerEmail: "billing@enterprise.co",
    productId: "prod_3",
    productName: "Enterprise Plan",
    items: [
      {
        id: "si_7",
        productId: "prod_3",
        productName: "Enterprise Plan",
        quantity: 1,
        unitPrice: 299,
        taxId: "tax_3",
        taxName: "Sales Tax",
        taxRate: 8.5,
        subtotal: 3588,
        taxAmount: 304.98,
        total: 3892.98,
      },
    ],
    status: "active",
    amount: 3892.98,
    subtotal: 3588,
    taxTotal: 304.98,
    currency: "USD",
    intervalCount: 1,
    interval: "year",
    startDate: "2024-06-01T00:00:00Z",
    currentPeriodStart: "2024-06-01T00:00:00Z",
    currentPeriodEnd: "2025-06-01T00:00:00Z",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    customerId: "cus_1",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    subscriptionId: "sub_1",
    subscriptionName: "Professional Plan",
    productId: "prod_2",
    productName: "Professional Plan",
    amount: 148,
    currency: "USD",
    status: "paid",
    dueDate: "2024-12-15T00:00:00Z",
    paidAt: "2024-12-10T14:30:00Z",
    createdAt: "2024-12-01T00:00:00Z",
    items: [
      {
        id: "ii_1",
        description: "Professional Plan - December",
        quantity: 1,
        unitPrice: 99,
        amount: 99,
      },
      {
        id: "ii_2",
        description: "API Access - December",
        quantity: 1,
        unitPrice: 49,
        amount: 49,
      },
    ],
  },
  {
    id: "inv_2",
    customerId: "cus_2",
    customerName: "TechStart Inc",
    customerEmail: "finance@techstart.io",
    subscriptionId: "sub_3",
    subscriptionName: "Starter Plan",
    productId: "prod_1",
    productName: "Starter Plan",
    amount: 29,
    currency: "USD",
    status: "paid",
    dueDate: "2024-12-20T00:00:00Z",
    paidAt: "2024-12-18T09:00:00Z",
    createdAt: "2024-12-05T00:00:00Z",
    items: [
      {
        id: "ii_3",
        description: "Starter Plan - December",
        quantity: 1,
        unitPrice: 29,
        amount: 29,
      },
    ],
  },
  {
    id: "inv_3",
    customerId: "cus_3",
    customerName: "Global Solutions",
    customerEmail: "accounts@globalsol.com",
    subscriptionId: "sub_4",
    subscriptionName: "Enterprise Plan",
    productId: "prod_3",
    productName: "Enterprise Plan",
    amount: 299,
    currency: "USD",
    status: "open",
    dueDate: "2025-01-10T00:00:00Z",
    createdAt: "2024-12-10T00:00:00Z",
    items: [
      {
        id: "ii_4",
        description: "Enterprise Plan - January",
        quantity: 1,
        unitPrice: 299,
        amount: 299,
      },
    ],
  },
  {
    id: "inv_4",
    customerId: "cus_4",
    customerName: "StartupXYZ",
    customerEmail: "hello@startupxyz.com",
    subscriptionId: "sub_5",
    subscriptionName: "Starter Plan",
    productId: "prod_1",
    productName: "Starter Plan",
    amount: 29,
    currency: "USD",
    status: "open",
    dueDate: "2024-12-30T00:00:00Z",
    createdAt: "2024-12-15T00:00:00Z",
    items: [
      {
        id: "ii_5",
        description: "Starter Plan - December",
        quantity: 1,
        unitPrice: 29,
        amount: 29,
      },
    ],
  },
  {
    id: "inv_5",
    customerId: "cus_5",
    customerName: "Enterprise Ltd",
    customerEmail: "billing@enterprise.co",
    subscriptionId: "sub_6",
    subscriptionName: "Enterprise Plan",
    productId: "prod_3",
    productName: "Enterprise Plan",
    amount: 3588,
    currency: "USD",
    status: "paid",
    dueDate: "2024-06-15T00:00:00Z",
    paidAt: "2024-06-10T11:00:00Z",
    createdAt: "2024-06-01T00:00:00Z",
    items: [
      {
        id: "ii_6",
        description: "Enterprise Plan - Annual",
        quantity: 1,
        unitPrice: 3588,
        amount: 3588,
      },
    ],
  },
];

const mockDashboardStats: DashboardStats = {
  totalRevenue: 96700,
  totalCustomers: 5,
  activeSubscriptions: 5,
  pendingInvoices: 2,
  revenueGrowth: 12.5,
  customerGrowth: 8.3,
};

const mockRevenueChart: ChartData[] = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 5800 },
  { name: "Mar", value: 6200 },
  { name: "Apr", value: 7100 },
  { name: "May", value: 8400 },
  { name: "Jun", value: 9200 },
  { name: "Jul", value: 8800 },
  { name: "Aug", value: 9500 },
  { name: "Sep", value: 10200 },
  { name: "Oct", value: 11000 },
  { name: "Nov", value: 10800 },
  { name: "Dec", value: 11500 },
];

// =============================================================================
// Auth API
// =============================================================================

export const authApi = {
  /**
   * POST /api/auth/login
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        id: data.userId,
        email: data.email,
        name: data.firstName + " " + data.lastName,
        emailVerified: data.emailVerified,
        createdAt: data.createdAt,
        workspaceId: data.workspaceId,
      },
    };
  },

  /**
   * POST /api/auth/login/google
   * Login with Google OAuth
   */
  loginWithGoogle: async (): Promise<ApiResponse<User>> => {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: {
        id: crypto.randomUUID(),
        email: "google.user@gmail.com",
        name: "Google User",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      },
    };
  },

  /**
   * POST /api/auth/signup
   * Register a new user
   */
  signup: async (
    email: string,
    password: string,
    name: string,
  ): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1],
      }),
    });

    if (!res.ok) {
      throw new Error("Signup failed");
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        id: data.userId,
        email: data.email,
        name: data.firstName + " " + data.lastName,
        emailVerified: data.emailVerified,
        createdAt: data.createdAt,
        workspaceId: data.workspaceId,
      },
      message: "Verification email sent!",
    };
  },

  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   */
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: null,
      message: `Password reset link sent to ${email}`,
    };
  },

  /**
   * POST /api/auth/verify-email
   * Verify email with token
   */
  verifyEmail: async (_token: string): Promise<ApiResponse<User>> => {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: { ...mockUsers[0], emailVerified: true },
      message: "Email verified successfully!",
    };
  },

  /**
   * POST /api/auth/resend-verification
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: null,
      message: `Verification email resent to ${email}`,
    };
  },

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  logout: async (): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: null };
  },

  /**
   * GET /api/auth/me
   * Get current user
   */
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("UNAUTHORIZED");
    return await res.json();
  },
};

// =============================================================================
// Customers API
// =============================================================================

export const customersApi = {
  /**
   * GET /api/customers
   */
  getAll: async (
    page = 1,
    pageSize = 10,
    workspaceId: string,
  ): Promise<PaginatedResponse<Customer>> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/clients?page=${page - 1}&size=${pageSize}`,
      {
        method: "GET",
        credentials: "include", // 🔥 required for cookies/JWT
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fetch clients failed (${res.status}): ${err}`);
    }

    const data = await res.json();

    return {
      data: data.content, // list of customers
      total: data.totalElements, // total records
      page: data.number + 1, // backend is 0-based
      pageSize: data.size,
      totalPages: data.totalPages,
    };
  },

  /**
   * GET /api/customers/:id
   */
  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    await delay(MOCK_DELAY);
    const customer = mockCustomers.find((c) => c.clientId === id);
    if (!customer) {
      return {
        success: false,
        data: null as any,
        message: "Customer not found",
      };
    }
    return { success: true, data: customer };
  },

  /**
   * POST /api/customers
   */
  create: async (
    d: Omit<
      CreateCustomerRequest,
      "id" | "createdAt" | "totalSpent" | "subscriptions"
    >,
  ): Promise<ApiResponse<Customer>> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${d.workspaceId}/clients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          contactNumber: d.contactNumber,
          companyName: d.companyName,
          countryCode: d.countryCode,
          taxId: d.taxId,
          billingAddress: d.billingAddress,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Create client failed (${res.status}): ${err}`);
    }

    const data = await res.json();

    return {
      success: true,
      data: {
        ...data,
        id: `cus_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
        totalSpent: 0,
        subscriptions: 0,
      },
    };
  },

  /**
   * PUT /api/customers/:id
   */
  update: async (
    id: string,
    d: Partial<Customer>,
  ): Promise<ApiResponse<Customer>> => {
    console.log("update", d);
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${d.workspaceId}/clients/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: d.name,
          email: d.email,
          contactNumber: d.contactNumber,
          companyName: d.companyName,
          countryCode: d.countryCode,
          taxId: d.taxId,
          billingAddress: d.billingAddress,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Create client failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    console.log(data);
    return {
      success: true,
      data: {
        ...data,
      },
    };
  },

  /**
   * DELETE /api/customers/:id
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: null, message: "Customer deleted" };
  },
};

// =============================================================================
// Products API
// =============================================================================

export const productsApi = {
  /**
   * GET /api/products
   */
  getAll: async (
    page = 1,
    pageSize = 10,
    workspaceId: string,
  ): Promise<PaginatedResponse<Product>> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/products?&page=${page - 1}&size=${pageSize}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fetch products failed (${res.status}): ${err}`);
    }

    const data = await res.json();

    return {
      data: data.content, // Spring Page<Product>
      total: data.totalElements,
      page: data.number + 1, // convert back to 1-based
      pageSize: data.size,
      totalPages: data.totalPages,
    };
  },

  /**
   * GET /api/products/:id
   */
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    await delay(MOCK_DELAY);
    const product = mockProducts.find((p) => p.productId === id);
    if (!product) {
      return {
        success: false,
        data: null as any,
        message: "Product not found",
      };
    }
    return { success: true, data: product };
  },

  /**
   * POST /api/products
   */
  create: async (
    data: Omit<CreateProductRequest, "id" | "createdAt">,
  ): Promise<ApiResponse<Product>> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${data.workspaceId}/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Create product failed (${res.status}): ${err}`);
    }

    const product: Product = await res.json();

    return {
      success: true,
      data: product,
    };
  },

  /**
   * PUT /api/products/:id
   */
  update: async (
    id: string,
    data: Partial<Product>,
  ): Promise<ApiResponse<Product>> => {
    console.log(data);
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${data.workspaceId}/products/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Create product failed (${res.status}): ${err}`);
    }

    const product: Product = await res.json();

    return {
      success: true,
      data: product,
    };
  },

  /**
   * DELETE /api/products/:id
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: null, message: "Product deleted" };
  },
};

// =============================================================================
// Subscriptions API
// =============================================================================

export const subscriptionsApi = {
  /**
   * GET /api/subscriptions
   */
  getAll: async (
    page = 1,
    pageSize = 10,
    workspaceId: string,
  ): Promise<PaginatedResponse<Subscription>> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/subscriptions?&page=${page - 1}&size=${pageSize}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fetch subscriptions failed (${res.status}): ${err}`);
    }

    const data = await res.json();

    return {
      data: data.content,
      total: data.totalElements,
      page: data.number + 1, // convert back to 1-based
      pageSize: data.size,
      totalPages: data.totalPages,
    };
  },

  /**
   * GET /api/subscriptions/:id
   */
  getById: async (id: string): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const subscription = mockSubscriptions.find((s) => s.id === id);
    if (!subscription) {
      return {
        success: false,
        data: null as any,
        message: "Subscription not found",
      };
    }
    return { success: true, data: subscription };
  },

  /**
   * POST /api/subscriptions
   */
  create: async (
    data: Omit<Subscription, "id" | "createdAt">,
  ): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const newSubscription: Subscription = {
      ...data,
      id: `sub_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newSubscription };
  },

  /**
   * PUT /api/subscriptions/:id
   */
  update: async (
    id: string,
    data: Partial<Subscription>,
  ): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const subscription = mockSubscriptions.find((s) => s.id === id);
    if (!subscription) {
      return {
        success: false,
        data: null as any,
        message: "Subscription not found",
      };
    }
    return { success: true, data: { ...subscription, ...data } };
  },

  /**
   * POST /api/subscriptions/:id/cancel
   */
  cancel: async (id: string): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const subscription = mockSubscriptions.find((s) => s.id === id);
    if (!subscription) {
      return {
        success: false,
        data: null as any,
        message: "Subscription not found",
      };
    }
    return { success: true, data: { ...subscription, status: "canceled" } };
  },

  /**
   * POST /api/subscriptions/:id/pause
   */
  pause: async (id: string): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const subscription = mockSubscriptions.find((s) => s.id === id);
    if (!subscription) {
      return {
        success: false,
        data: null as any,
        message: "Subscription not found",
      };
    }
    return { success: true, data: { ...subscription, status: "paused" } };
  },

  /**
   * POST /api/subscriptions/:id/resume
   */
  resume: async (id: string): Promise<ApiResponse<Subscription>> => {
    await delay(MOCK_DELAY);
    const subscription = mockSubscriptions.find((s) => s.id === id);
    if (!subscription) {
      return {
        success: false,
        data: null as any,
        message: "Subscription not found",
      };
    }
    return { success: true, data: { ...subscription, status: "active" } };
  },
};

// =============================================================================
// Invoices API
// =============================================================================

export const invoicesApi = {
  /**
   * GET /api/invoices
   */
  getAll: async (
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const start = (page - 1) * pageSize;
    const paginatedData = mockInvoices.slice(start, start + pageSize);
    return {
      data: paginatedData,
      total: mockInvoices.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockInvoices.length / pageSize),
    };
  },

  /**
   * GET /api/invoices/:id
   */
  getById: async (id: string): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) {
      return {
        success: false,
        data: null as any,
        message: "Invoice not found",
      };
    }
    return { success: true, data: invoice };
  },

  /**
   * POST /api/invoices
   */
  create: async (
    data: Omit<Invoice, "id" | "createdAt">,
  ): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const newInvoice: Invoice = {
      ...data,
      id: `inv_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newInvoice };
  },

  /**
   * PUT /api/invoices/:id
   */
  update: async (
    id: string,
    data: Partial<Invoice>,
  ): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) {
      return {
        success: false,
        data: null as any,
        message: "Invoice not found",
      };
    }
    return { success: true, data: { ...invoice, ...data } };
  },

  /**
   * POST /api/invoices/:id/send
   */
  send: async (id: string): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) {
      return {
        success: false,
        data: null as any,
        message: "Invoice not found",
      };
    }
    return {
      success: true,
      data: { ...invoice, status: "open" },
      message: "Invoice sent",
    };
  },

  /**
   * POST /api/invoices/:id/mark-paid
   */
  markPaid: async (id: string): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) {
      return {
        success: false,
        data: null as any,
        message: "Invoice not found",
      };
    }
    return {
      success: true,
      data: { ...invoice, status: "paid", paidAt: new Date().toISOString() },
    };
  },

  /**
   * POST /api/invoices/:id/void
   */
  void: async (id: string): Promise<ApiResponse<Invoice>> => {
    await delay(MOCK_DELAY);
    const invoice = mockInvoices.find((i) => i.id === id);
    if (!invoice) {
      return {
        success: false,
        data: null as any,
        message: "Invoice not found",
      };
    }
    return { success: true, data: { ...invoice, status: "void" } };
  },

  /**
   * DELETE /api/invoices/:id
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: null, message: "Invoice deleted" };
  },
};

// =============================================================================
// Dashboard API
// =============================================================================

export const dashboardApi = {
  /**
   * GET /api/dashboard/stats
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: mockDashboardStats };
  },

  /**
   * GET /api/dashboard/revenue-chart
   */
  getRevenueChart: async (): Promise<ApiResponse<ChartData[]>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: mockRevenueChart };
  },

  /**
   * GET /api/dashboard/recent-customers
   */
  getRecentCustomers: async (limit = 5): Promise<ApiResponse<Customer[]>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: mockCustomers.slice(0, limit) };
  },

  /**
   * GET /api/dashboard/recent-invoices
   */
  getRecentInvoices: async (limit = 5): Promise<ApiResponse<Invoice[]>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: mockInvoices.slice(0, limit) };
  },
};

// =============================================================================
// Taxes API
// =============================================================================

export const taxesApi = {
  /**
   * GET /api/taxes
   */
  getAll: async (): Promise<ApiResponse<Tax[]>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: mockTaxes };
  },

  /**
   * POST /api/taxes
   */
  create: async (
    data: Omit<Tax, "id" | "createdAt">,
  ): Promise<ApiResponse<Tax>> => {
    await delay(MOCK_DELAY);
    const newTax: Tax = {
      ...data,
      id: `tax_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newTax };
  },

  /**
   * PUT /api/taxes/:id
   */
  update: async (id: string, data: Partial<Tax>): Promise<ApiResponse<Tax>> => {
    await delay(MOCK_DELAY);
    const tax = mockTaxes.find((t) => t.id === id);
    if (!tax) {
      return { success: false, data: null as any, message: "Tax not found" };
    }
    return { success: true, data: { ...tax, ...data } };
  },

  /**
   * DELETE /api/taxes/:id
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(MOCK_DELAY);
    return { success: true, data: null, message: "Tax deleted" };
  },
};

// =============================================================================
// Export all APIs
// =============================================================================

export const api = {
  auth: authApi,
  customers: customersApi,
  products: productsApi,
  subscriptions: subscriptionsApi,
  invoices: invoicesApi,
  dashboard: dashboardApi,
  taxes: taxesApi,
};

export default api;
