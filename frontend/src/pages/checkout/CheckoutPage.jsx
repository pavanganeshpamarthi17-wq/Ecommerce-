import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { createPaymentIntent, createOrder } from '../../store/slices/orderSlice';
import { notify } from '../../store/slices/uiSlice';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const STEPS = ['Address', 'Payment', 'Confirm'];

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

// Inner form component (needs Stripe context)
const CheckoutForm = ({ shippingAddress, items, pricing, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const { paymentIntent, loading } = useSelector((s) => s.orders);
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError('');

    try {
      // Confirm card payment
      const { error, paymentIntent: pi } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: shippingAddress.fullName },
          },
        }
      );

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      if (pi.status === 'succeeded') {
        // Create order in DB
        const result = await dispatch(createOrder({
          shippingAddress,
          paymentMethod: 'stripe',
          paymentInfo: {
            stripePaymentIntentId: pi.id,
            status: 'paid',
          },
        }));

        if (createOrder.fulfilled.match(result)) {
          onSuccess(result.payload.order._id);
        } else {
          dispatch(notify(result.payload || 'Order creation failed', 'error'));
        }
      }
    } catch (err) {
      setCardError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" /> Card Details
        </h3>
        <div className="border border-gray-200 rounded-xl p-3.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <CardElement options={CARD_STYLE} />
        </div>
        {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          Payments secured by Stripe. Test card: 4242 4242 4242 4242
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="btn btn-primary w-full text-base py-3"
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </span>
        ) : `Pay ₹${pricing?.total?.toLocaleString()}`}
      </button>
    </form>
  );
};

const MockCheckoutForm = ({ shippingAddress, items, pricing, onSuccess, paymentIntent }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.orders);
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setCardError('');

    setTimeout(async () => {
      const result = await dispatch(createOrder({
        shippingAddress,
        paymentMethod: 'stripe',
        paymentInfo: {
          stripePaymentIntentId: paymentIntent.paymentIntentId || 'pi_mock_id_' + Math.random().toString(36).substr(2, 9),
          status: 'paid',
        },
      }));

      if (createOrder.fulfilled.match(result)) {
        onSuccess(result.payload.order._id);
      } else {
        setCardError(result.payload || 'Order creation failed');
        setProcessing(false);
      }
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card p-5 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" /> Card Details (MOCK MODE)
        </h3>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-xl p-3.5">
            <input
              type="text"
              placeholder="Card Number (4242 4242 4242 4242)"
              required
              className="w-full focus:outline-none text-gray-800 bg-transparent"
              value={cardData.number}
              onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-3.5">
              <input
                type="text"
                placeholder="MM/YY"
                required
                className="w-full focus:outline-none text-gray-800 bg-transparent"
                value={cardData.expiry}
                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
              />
            </div>
            <div className="border border-gray-200 rounded-xl p-3.5">
              <input
                type="password"
                placeholder="CVC"
                required
                className="w-full focus:outline-none text-gray-800 bg-transparent"
                value={cardData.cvc}
                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
              />
            </div>
          </div>
        </div>
        {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          Payments secured by Mock Stripe. Use any card info.
        </div>
      </div>

      <button
        type="submit"
        disabled={processing || loading}
        className="btn btn-primary w-full text-base py-3"
      >
        {processing ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing Mock Payment…
          </span>
        ) : `Pay ₹${pricing?.total?.toLocaleString()}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, subtotal, tax, shippingCost, total } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { paymentIntent } = useSelector((s) => s.orders);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  });

  const activeItems = items.filter((i) => !i.savedForLater);

  useEffect(() => {
    if (activeItems.length === 0) navigate('/cart');
  }, [activeItems.length, navigate]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    // Create payment intent before moving to payment step
    const result = await dispatch(createPaymentIntent({ shippingAddress: address }));
    if (createPaymentIntent.fulfilled.match(result)) {
      setStep(1);
    } else {
      dispatch(notify('Failed to initialize payment', 'error'));
    }
  };

  const handleSuccess = (orderId) => {
    navigate(`/order-success/${orderId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-sm font-medium ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? 'bg-blue-600 text-white' : i === step ? 'border-2 border-blue-600 text-blue-600' : 'border-2 border-gray-200 text-gray-400'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <form onSubmit={handleAddressSubmit} className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} required className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} required className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input type="text" value={address.address} onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))} required className="input" placeholder="Street address, apartment, suite" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <input type="text" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <input type="text" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                  <input type="text" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required className="input" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto px-8">
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 1: Payment */}
          {step === 1 && paymentIntent && (
            <div>
              <div className="card p-4 mb-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Delivering to
                </h3>
                <p className="text-sm text-gray-600">{address.fullName} • {address.phone}</p>
                <p className="text-sm text-gray-600">{address.address}, {address.city}, {address.state} {address.postalCode}</p>
                <button onClick={() => setStep(0)} className="text-xs text-blue-600 mt-1">Change</button>
              </div>

              {paymentIntent.clientSecret.startsWith('pi_mock_secret_') ? (
                <MockCheckoutForm
                  shippingAddress={address}
                  items={activeItems}
                  pricing={{ total }}
                  onSuccess={handleSuccess}
                  paymentIntent={paymentIntent}
                />
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
                  <CheckoutForm
                    shippingAddress={address}
                    items={activeItems}
                    pricing={{ total }}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {activeItems.map((item) => (
                <div key={item._id} className="flex gap-3 text-sm">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 line-clamp-2 text-xs">{item.product?.title}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-xs flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{tax?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
                <span>Total</span><span>₹{total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
