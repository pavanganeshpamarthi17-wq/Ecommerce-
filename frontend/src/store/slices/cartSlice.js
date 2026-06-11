import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart', { productId, quantity });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subtotal: 0,
    tax: 0,
    shippingCost: 0,
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handleCartResponse = (state, action) => {
      state.loading = false;
      state.items = action.payload.cart?.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.tax = action.payload.tax || 0;
      state.shippingCost = action.payload.shippingCost || 0;
      state.total = action.payload.total || 0;
      state.itemCount = state.items.filter((i) => !i.savedForLater).reduce((acc, i) => acc + i.quantity, 0);
    };
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart].forEach((thunk) => {
      builder
        .addCase(thunk.pending, handlePending)
        .addCase(thunk.fulfilled, handleCartResponse)
        .addCase(thunk.rejected, handleRejected);
    });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
