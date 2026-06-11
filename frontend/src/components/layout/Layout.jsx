import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <CartSidebar />
  </div>
);

export default Layout;
