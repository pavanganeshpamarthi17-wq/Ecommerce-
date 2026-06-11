import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { fetchCategories } from './store/slices/productSlice';

// Layout
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Pages - Customer
import HomePage from './pages/HomePage';
import ProductsPage from './pages/product/ProductsPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderSuccessPage from './pages/order/OrderSuccessPage';
import OrdersPage from './pages/order/OrdersPage';
import OrderDetailPage from './pages/order/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProductForm from './pages/admin/AdminProductForm';

// Components
import NotificationContainer from './components/common/NotificationContainer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  if (loading) return <LoadingSpinner fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth);
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(getMe());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <NotificationContainer />
      <Routes>
        {/* Public customer routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
