import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  LogOut, Menu, X, ChevronRight, Bell, ShoppingCart,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { notify } from '../../store/slices/uiSlice';
import NotificationContainer from '../common/NotificationContainer';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(notify('Logged out successfully', 'success'));
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">ShopNow</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-700">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <NotificationContainer />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-gray-900 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 h-full bg-gray-900 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden font-semibold text-gray-800">Admin Panel</div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
