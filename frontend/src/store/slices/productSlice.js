import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const adminCreateProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/products', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const adminUpdateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const adminDeleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    currentProduct: null,
    relatedProducts: [],
    categories: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
    filters: {
      keyword: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
      inStock: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        keyword: '',
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        sort: 'newest',
        inStock: '',
      };
    },
    clearError: (state) => { state.error = null; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.related || [];
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload.products;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      })

      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilters, resetFilters, clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
