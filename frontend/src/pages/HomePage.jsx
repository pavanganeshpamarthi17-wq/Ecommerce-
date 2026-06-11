import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Truck, Shield, RotateCcw, Star, ArrowRight } from 'lucide-react';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹500' },
  { icon: Shield, title: 'Secure Payment', desc: '100% safe & secure' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Star, title: 'Top Quality', desc: 'Verified products only' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { featured, loading, categories } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchFeaturedProducts()); }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-block bg-blue-500/30 text-blue-100 text-sm font-medium px-3 py-1 rounded-full mb-4">
              🎉 New Arrivals Every Week
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Shop Smarter,<br />Live Better
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Discover thousands of quality products at unbeatable prices. Fast shipping, easy returns, and 24/7 support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn bg-white text-blue-700 hover:bg-blue-50 text-base px-6 py-3 font-semibold">
                <ShoppingBag className="w-5 h-5" /> Shop Now
              </Link>
              <Link to="/products?sort=popular" className="btn border border-blue-400 text-white hover:bg-blue-600/50 text-base px-6 py-3">
                Best Sellers <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-0.5">Handpicked by our team</p>
          </div>
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No featured products yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
