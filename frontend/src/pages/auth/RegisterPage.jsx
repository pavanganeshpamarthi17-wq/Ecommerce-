import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, ShoppingCart, User, Mail, Lock } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { notify } from '../../store/slices/uiSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    dispatch(clearError());
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(result)) {
      dispatch(notify('Account created! Welcome aboard!', 'success'));
      navigate('/');
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopNow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start shopping today</p>
        </div>

        <div className="card p-6 sm:p-8">
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 chars, upper + lower + number"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full text-base py-2.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
