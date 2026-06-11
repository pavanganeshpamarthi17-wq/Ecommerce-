import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">ShopNow</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Your one-stop destination for quality products at great prices, delivered fast.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/products', 'Products'], ['/orders', 'My Orders'], ['/profile', 'Profile']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2">
            {['FAQ', 'Shipping Policy', 'Returns & Refunds', 'Track Your Order', 'Contact Us'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
              123 Commerce Street, Mumbai, India
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
              support@shopnow.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} ShopNow. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
