import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RouteGuard from './routes/RouteGuard';
import ToastContainer from './components/ui/Toast';
import Navbar from './components/common/Navbar';
import AdminPreviewBanner from './components/admin/AdminPreviewBanner';

// Public pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import BookingPage from './pages/BookingPage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import DiscountManagement from './pages/admin/DiscountManagement';
import BookingManagement from './pages/admin/BookingManagement';
import ReviewManagement from './pages/admin/ReviewManagement';

// Public layout wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
    <AdminPreviewBanner />
  </>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<PublicLayout><ProductListingPage /></PublicLayout>} />
          <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><ShoppingCartPage /></PublicLayout>} />

          {/* Protected user routes */}
          <Route path="/checkout" element={<RouteGuard><PublicLayout><CheckoutPage /></PublicLayout></RouteGuard>} />
          <Route path="/orders" element={<RouteGuard><PublicLayout><OrdersPage /></PublicLayout></RouteGuard>} />
          <Route path="/bookings" element={<RouteGuard><PublicLayout><BookingPage /></PublicLayout></RouteGuard>} />

          {/* Admin routes */}
          <Route path="/admin" element={<RouteGuard requireAdmin><AdminLayout /></RouteGuard>}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;
