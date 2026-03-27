
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
import { NotificationProvider } from './context/NotificationContext';
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
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

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
        <NotificationProvider>
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
                  <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                  <Route path="/order/:id" element={<PrivateRoute><OrderDetailsPage /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                  <Route path="/myorders" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
                  <Route path="/consultation" element={<PrivateRoute><ConsultationPage /></PrivateRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
                  <Route path="/admin/products/create" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
                  <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductEditPage /></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                  <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
                  <Route path="/admin/consultations" element={<AdminRoute><AdminConsultationsPage /></AdminRoute>} />
                </Routes>
              </main>
            </div>
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router >
  );
}

export default App;
