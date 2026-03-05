
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestionnairePage from './pages/QuestionnairePage';
import ProductListPage from './pages/ProductListPage';
import CartPage from './pages/CartPage';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'react-hot-toast';

import RecommendationsPage from './pages/RecommendationsPage';
import WishlistPage from './pages/WishlistPage';

import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ConsultationPage from './pages/ConsultationPage';
import MyOrdersPage from './pages/MyOrdersPage';

// Admin Pages
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductEditPage from './pages/AdminProductEditPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminConsultationsPage from './pages/AdminConsultationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                style: {
                  marginTop: '60px',
                  fontWeight: 'bold',
                },
              }}
            />
            <div className="bg-gray-50 min-h-screen text-gray-800">
              <Header />
              <main className="py-3">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/assessment" element={<QuestionnairePage />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                  <Route path="/shop" element={<ProductListPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order/:id" element={<OrderDetailsPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/myorders" element={<MyOrdersPage />} />
                  <Route path="/consultation" element={<ConsultationPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/products/create" element={<AdminProductEditPage />} />
                  <Route path="/admin/products/:id/edit" element={<AdminProductEditPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="/admin/consultations" element={<AdminConsultationsPage />} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router >
  );
}

export default App;
