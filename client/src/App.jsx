
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

import RecommendationsPage from './pages/RecommendationsPage';

import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';

import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ConsultationPage from './pages/ConsultationPage';

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
        <CartProvider>
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
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
