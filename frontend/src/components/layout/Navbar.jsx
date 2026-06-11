import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, User, Heart, Search, Menu, X,
  ChevronDown, LogOut, Package, Settings, LayoutDashboard, Sun, Moon,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleCartSidebar } from '../../store/slices/uiSlice';
import { notify } from '../../store/slices/uiSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { itemCount } = useSelector((s) => s.cart);
  const { categories } = useSelector((s) => s.products);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(notify('Logged out successfully', 'success'));
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">ShopNow</span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-650" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCartSidebar())}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 hidden sm:block">
                <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 transition-colors duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link to="/login" className="btn btn-outline text-sm py-1.5 px-3 hidden sm:flex">Login</Link>
                <Link to="/register" className="btn btn-primary text-sm py-1.5 px-3">Sign up</Link>
              </div>
            )}            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 md:hidden"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category nav - desktop */}
        <nav className="hidden md:flex items-center gap-6 pb-2 overflow-x-auto">
          <Link to="/products" className="text-sm font-medium text-gray-600 dark:text-gray-350 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
            All Products
          </Link>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-4 space-y-3 transition-colors duration-200">
          <form onSubmit={handleSearch} className="pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/products" className="py-2 text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>All Products</Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="py-2 text-sm text-gray-600 dark:text-gray-400"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn btn-outline flex-1 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary flex-1 text-sm" onClick={() => setMobileOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
