import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, ArrowLeft, ShoppingCart } from 'lucide-react';
import { forgotPassword } from '../../store/slices/authSlice';
import { notify } from '../../store/slices/uiSlice';

export const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(forgotPassword(email));
    setLoading(false);
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
    } else {
      dispatch(notify('Failed to send reset email', 'error'));
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
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for {email}, a reset link has been sent.
              </p>
              <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input pl-10"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
