import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/toggle', { productId });
    return { ...res.data, productId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const moveToCart = createAsyncThunk('wishlist/moveToCart', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/move-to-cart', { productId });
    return { ...res.data, productId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload.wishlist?.products || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload.added) {
          // product object added via re-fetch; just track IDs here
        } else {
          state.products = state.products.filter(
            (p) => (p._id || p) !== action.payload.productId
          );
        }
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => (p._id || p) !== action.payload.productId
        );
      });
  },
});

export default wishlistSlice.reducer;
