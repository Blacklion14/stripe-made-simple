import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Customer, PaginatedResponse } from '@/types';
import { customersApi } from '@/services/api';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) => {
    const response = await customersApi.getAll(page, pageSize);
    return response;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id: string, { rejectWithValue }) => {
    const response = await customersApi.getById(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'subscriptions'>, { rejectWithValue }) => {
    const response = await customersApi.create(data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    const response = await customersApi.update(id, data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id: string, { rejectWithValue }) => {
    const response = await customersApi.delete(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return id;
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<PaginatedResponse<Customer>>) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      });

    // Fetch by ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      });

    // Delete
    builder
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      });
  },
});

export const { clearError, setSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;
