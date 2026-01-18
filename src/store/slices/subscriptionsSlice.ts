import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  Subscription,
  PaginatedResponse,
  PaginationPayload,
} from "@/types";
import { subscriptionsApi } from "@/services/api";

interface SubscriptionsState {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationPayload;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  selectedSubscription: null,
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
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async ({
    page = 1,
    pageSize = 10,
    workspaceId,
  }: {
    page?: number;
    pageSize?: number;
    workspaceId: string;
  }) => {
    const response = await subscriptionsApi.getAll(page, pageSize, workspaceId);
    return response;
  },
);

export const fetchSubscriptionById = createAsyncThunk(
  "subscriptions/fetchById",
  async (id: string, { rejectWithValue }) => {
    const response = await subscriptionsApi.getById(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

export const createSubscription = createAsyncThunk(
  "subscriptions/create",
  async (data: Omit<Subscription, "id" | "createdAt">, { rejectWithValue }) => {
    const response = await subscriptionsApi.create(data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

export const updateSubscription = createAsyncThunk(
  "subscriptions/update",
  async (
    { id, data }: { id: string; data: Partial<Subscription> },
    { rejectWithValue },
  ) => {
    const response = await subscriptionsApi.update(id, data);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

export const cancelSubscription = createAsyncThunk(
  "subscriptions/cancel",
  async (id: string, { rejectWithValue }) => {
    const response = await subscriptionsApi.cancel(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

export const pauseSubscription = createAsyncThunk(
  "subscriptions/pause",
  async (id: string, { rejectWithValue }) => {
    const response = await subscriptionsApi.pause(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

export const resumeSubscription = createAsyncThunk(
  "subscriptions/resume",
  async (id: string, { rejectWithValue }) => {
    const response = await subscriptionsApi.resume(id);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response.data;
  },
);

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSubscription: (
      state,
      action: PayloadAction<Subscription | null>,
    ) => {
      state.selectedSubscription = action.payload;
    },
    setSubscriptions: (state, action: PayloadAction<Subscription[] | []>) => {
      state.subscriptions = action.payload;
    },
    setSubsPagination: (state, action: PayloadAction<PaginationPayload>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSubscriptions.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Subscription>>) => {
          state.isLoading = false;
          state.subscriptions = action.payload.data;
          state.pagination = {
            page: action.payload.page,
            pageSize: action.payload.pageSize,
            total: action.payload.total,
            totalPages: action.payload.totalPages,
          };
        },
      )
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch subscriptions";
      });

    // Fetch by ID
    builder
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSubscription = action.payload;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder.addCase(updateSubscription.fulfilled, (state, action) => {
      const index = state.subscriptions.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
      if (state.selectedSubscription?.id === action.payload.id) {
        state.selectedSubscription = action.payload;
      }
    });

    // Cancel
    builder.addCase(cancelSubscription.fulfilled, (state, action) => {
      const index = state.subscriptions.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    });

    // Pause
    builder.addCase(pauseSubscription.fulfilled, (state, action) => {
      const index = state.subscriptions.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    });

    // Resume
    builder.addCase(resumeSubscription.fulfilled, (state, action) => {
      const index = state.subscriptions.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (index !== -1) {
        state.subscriptions[index] = action.payload;
      }
    });
  },
});

export const {
  clearError,
  setSubscriptions,
  setSubsPagination,
  setSelectedSubscription,
} = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
