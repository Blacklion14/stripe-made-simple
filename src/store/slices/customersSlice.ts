import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Customer, PaginatedResponse } from '@/types';
import { customersApi } from '@/services/api';
import { CreateCustomerRequest } from '@/types';

/* -------------------- State -------------------- */

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

/* -------------------- Async Thunks -------------------- */

// Fetch paginated customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (
    { page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      return await customersApi.getAll(page, pageSize);
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to fetch customers');
    }
  }
);

// Fetch single customer
export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (clientId: string, { rejectWithValue }) => {
    const response = await customersApi.getById(clientId);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

// Create customer
export const createCustomer = createAsyncThunk(
  'customers/create',
  async (
    data: CreateCustomerRequest,
    { rejectWithValue }
  ) => {
    const response = await customersApi.create(data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customers/update',
  async (
    { clientId, data }: { clientId: string; data: Partial<Customer> },
    { rejectWithValue }
  ) => {
    const response = await customersApi.update(clientId, data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (clientId: string, { rejectWithValue }) => {
    const response = await customersApi.delete(clientId);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return clientId;
  }
);

/* -------------------- Slice -------------------- */

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
    /* ---------- Fetch All ---------- */
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomers.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Customer>>) => {
          state.isLoading = false;
          state.customers = action.payload.data;
          state.pagination = {
            page: action.payload.page,
            pageSize: action.payload.pageSize,
            total: action.payload.total,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    /* ---------- Fetch By ID ---------- */
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

    /* ---------- Create ---------- */
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

    /* ---------- Update ---------- */
    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      const index = state.customers.findIndex(
        (c) => c.clientId === action.payload.clientId
      );

      if (index !== -1) {
        state.customers[index] = action.payload;
      }

      if (
        state.selectedCustomer?.clientId === action.payload.clientId
      ) {
        state.selectedCustomer = action.payload;
      }
    });

    /* ---------- Delete ---------- */
    builder.addCase(deleteCustomer.fulfilled, (state, action) => {
      state.customers = state.customers.filter(
        (c) => c.clientId !== action.payload
      );
      state.pagination.total -= 1;

      if (state.selectedCustomer?.clientId === action.payload) {
        state.selectedCustomer = null;
      }
    });
  },
});

/* -------------------- Exports -------------------- */

export const { clearError, setSelectedCustomer } =
  customersSlice.actions;

export default customersSlice.reducer;