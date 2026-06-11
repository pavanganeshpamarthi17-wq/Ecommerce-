import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import { resetPassword } from '../../store/slices/authSlice';
import { notify } from '../../store/slices/uiSlice';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const result = await dispatch(resetPassword({ token, password: form.password }));
    setLoading(false);
    if (resetPassword.fulfilled.match(result)) {
      dispatch(notify('Password reset successfully!', 'success'));
      navigate('/login');
    } else {
      setError(result.payload || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your new password</p>
        </div>

        <div className="card p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
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
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
