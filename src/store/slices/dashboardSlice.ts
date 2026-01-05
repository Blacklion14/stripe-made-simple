import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardStats, ChartData, Customer, Invoice } from '@/types';
import { dashboardApi } from '@/services/api';

interface DashboardState {
  stats: DashboardStats | null;
  revenueChart: ChartData[];
  recentCustomers: Customer[];
  recentInvoices: Invoice[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  revenueChart: [],
  recentCustomers: [],
  recentInvoices: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    const response = await dashboardApi.getStats();
    return response.data;
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'dashboard/fetchRevenueChart',
  async () => {
    const response = await dashboardApi.getRevenueChart();
    return response.data;
  }
);

export const fetchRecentCustomers = createAsyncThunk(
  'dashboard/fetchRecentCustomers',
  async (limit: number = 5) => {
    const response = await dashboardApi.getRecentCustomers(limit);
    return response.data;
  }
);

export const fetchRecentInvoices = createAsyncThunk(
  'dashboard/fetchRecentInvoices',
  async (limit: number = 5) => {
    const response = await dashboardApi.getRecentInvoices(limit);
    return response.data;
  }
);

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRevenueChart()),
      dispatch(fetchRecentCustomers(5)),
      dispatch(fetchRecentInvoices(5)),
    ]);
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });

    // Fetch revenue chart
    builder
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.revenueChart = action.payload;
      });

    // Fetch recent customers
    builder
      .addCase(fetchRecentCustomers.fulfilled, (state, action) => {
        state.recentCustomers = action.payload;
      });

    // Fetch recent invoices
    builder
      .addCase(fetchRecentInvoices.fulfilled, (state, action) => {
        state.recentInvoices = action.payload;
      });

    // Fetch all dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
