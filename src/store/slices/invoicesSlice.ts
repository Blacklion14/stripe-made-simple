import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Invoice, PaginatedResponse } from '@/types';
import { invoicesApi } from '@/services/api';

interface InvoicesState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const initialState: InvoicesState = {
  invoices: [],
  selectedInvoice: null,
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
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) => {
    const response = await invoicesApi.getAll(page, pageSize);
    return response;
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchById',
  async (id: string, { rejectWithValue }) => {
    const response = await invoicesApi.getById(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/create',
  async (data: Omit<Invoice, 'id' | 'createdAt'>, { rejectWithValue }) => {
    const response = await invoicesApi.create(data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: string; data: Partial<Invoice> }, { rejectWithValue }) => {
    const response = await invoicesApi.update(id, data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/send',
  async (id: string, { rejectWithValue }) => {
    const response = await invoicesApi.send(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const markInvoicePaid = createAsyncThunk(
  'invoices/markPaid',
  async (id: string, { rejectWithValue }) => {
    const response = await invoicesApi.markPaid(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const voidInvoice = createAsyncThunk(
  'invoices/void',
  async (id: string, { rejectWithValue }) => {
    const response = await invoicesApi.void(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: string, { rejectWithValue }) => {
    const response = await invoicesApi.delete(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return id;
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<PaginatedResponse<Invoice>>) => {
        state.isLoading = false;
        state.invoices = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      });

    // Fetch by ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.selectedInvoice?.id === action.payload.id) {
          state.selectedInvoice = action.payload;
        }
      });

    // Send
    builder
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });

    // Mark Paid
    builder
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });

    // Void
    builder
      .addCase(voidInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });

    // Delete
    builder
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(i => i.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedInvoice?.id === action.payload) {
          state.selectedInvoice = null;
        }
      });
  },
});

export const { clearError, setSelectedInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;
