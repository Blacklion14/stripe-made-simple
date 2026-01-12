import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Tax } from '@/types';
import { taxesApi } from '@/services/api';

interface TaxesState {
  taxes: Tax[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaxesState = {
  taxes: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTaxes = createAsyncThunk(
  'taxes/fetchAll',
  async () => {
    const response = await taxesApi.getAll();
    return response.data;
  }
);

export const createTax = createAsyncThunk(
  'taxes/create',
  async (data: Omit<Tax, 'id' | 'createdAt'>, { rejectWithValue }) => {
    const response = await taxesApi.create(data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const updateTax = createAsyncThunk(
  'taxes/update',
  async ({ id, data }: { id: string; data: Partial<Tax> }, { rejectWithValue }) => {
    const response = await taxesApi.update(id, data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  }
);

export const deleteTax = createAsyncThunk(
  'taxes/delete',
  async (id: string, { rejectWithValue }) => {
    const response = await taxesApi.delete(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return id;
  }
);

const taxesSlice = createSlice({
  name: 'taxes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchTaxes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaxes.fulfilled, (state, action: PayloadAction<Tax[]>) => {
        state.isLoading = false;
        state.taxes = action.payload;
      })
      .addCase(fetchTaxes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch taxes';
      });

    // Create
    builder
      .addCase(createTax.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTax.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxes.unshift(action.payload);
      })
      .addCase(createTax.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateTax.fulfilled, (state, action) => {
        const index = state.taxes.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.taxes[index] = action.payload;
        }
      });

    // Delete
    builder
      .addCase(deleteTax.fulfilled, (state, action) => {
        state.taxes = state.taxes.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearError } = taxesSlice.actions;
export default taxesSlice.reducer;
