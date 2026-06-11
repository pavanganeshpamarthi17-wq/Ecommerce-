import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createPaymentIntent = createAsyncThunk('orders/createPaymentIntent', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/payments/create-intent', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const adminFetchOrders = createAsyncThunk('orders/adminFetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/admin/all', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const adminUpdateOrderStatus = createAsyncThunk('orders/adminUpdateStatus', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/status`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchAnalytics = createAsyncThunk('orders/analytics', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/admin/analytics');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    paymentIntent: null,
    analytics: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentOrder: (state) => { state.currentOrder = null; },
    clearPaymentIntent: (state) => { state.paymentIntent = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(createOrder.pending, pending)
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, rejected)

      .addCase(fetchMyOrders.pending, pending)
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMyOrders.rejected, rejected)

      .addCase(fetchOrder.pending, pending)
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrder.rejected, rejected)

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        const idx = state.orders.findIndex((o) => o._id === action.payload.order._id);
        if (idx !== -1) state.orders[idx] = action.payload.order;
      })

      .addCase(createPaymentIntent.pending, pending)
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, rejected)

      .addCase(adminFetchOrders.pending, pending)
      .addCase(adminFetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(adminFetchOrders.rejected, rejected)

      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => o._id === action.payload.order._id);
        if (idx !== -1) state.orders[idx] = action.payload.order;
        if (state.currentOrder?._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
      })

      .addCase(fetchAnalytics.pending, pending)
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.stats;
      })
      .addCase(fetchAnalytics.rejected, rejected);
  },
});

export const { clearError, clearCurrentOrder, clearPaymentIntent } = orderSlice.actions;
export default orderSlice.reducer;
