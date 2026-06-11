import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, DollarSign,
  TrendingUp, ArrowRight, AlertCircle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchAnalytics } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (loading && !analytics) return <LoadingSpinner />;
  if (!analytics) return (
    <div className="text-center py-16 text-gray-400">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      <p>Failed to load analytics</p>
    </div>
  );

  const statusData = analytics.ordersByStatus?.map((s) => ({
    name: s._id,
    value: s.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(analytics.totalRevenue || 0).toLocaleString()}`} sub={`₹${(analytics.monthRevenue || 0).toLocaleString()} this month`} color="bg-blue-600" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={analytics.totalOrders || 0} sub={`${analytics.monthOrders || 0} this month`} color="bg-purple-600" />
        <StatCard icon={Users} label="Total Customers" value={analytics.totalUsers || 0} color="bg-green-600" />
        <StatCard icon={Package} label="Active Products" value={analytics.totalProducts || 0} color="bg-orange-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Sales Trend (Last 30 Days)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="_id"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(v) => v?.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v) => v?.charAt(0).toUpperCase() + v?.slice(1)} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Top products */}
      {analytics.topProducts?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Top Products by Revenue</h3>
            <Link to="/admin/products" className="text-sm text-blue-600 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="title" tick={{ fontSize: 11, fill: '#9ca3af' }} width={120} tickFormatter={(v) => v?.length > 18 ? v.slice(0, 18) + '…' : v} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
