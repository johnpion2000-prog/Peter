import { Routes, Route } from 'react-router-dom';
import RouteGuard from './RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Public pages
import HomePage from '../pages/HomePage';
import ProductListingPage from '../pages/ProductListingPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderSuccessPage from '../pages/OrderSuccessPage';
import ProfilePage from '../pages/ProfilePage';
import CompanyStorefrontPage from '../pages/CompanyStorefrontPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import PendingApprovalPage from '../pages/auth/PendingApprovalPage';

// Admin pages
import AdminLayout from '../pages/admin/AdminLayout';
import DashboardHome from '../pages/admin/DashboardHome';
import ProductManagement from '../pages/admin/ProductManagement';
import CategoryManagement from '../pages/admin/CategoryManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import UserManagement from '../pages/admin/UserManagement';
import DiscountManagement from '../pages/admin/DiscountManagement';
import CompanyManagement from '../pages/admin/CompanyManagement';
import CompanyProfilePage from '../pages/admin/CompanyProfilePage';

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-7xl">✨</p>
      <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-orange-500 font-medium hover:text-orange-600">← Go home</a>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Auth (no layout) ── */}
      <Route path="/signin"          element={<LoginPage />} />
      <Route path="/signup"          element={<RegisterPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />

      {/* ── Admin (protected, sidebar layout) ── */}
      <Route
        path="/admin"
        element={
          <RouteGuard roles={['superAdmin', 'companyAdmin']}>
            <AdminLayout />
          </RouteGuard>
        }
      >
        <Route index                       element={<DashboardHome />} />
        <Route path="products"             element={<ProductManagement />} />
        <Route path="categories"           element={<RouteGuard roles={['superAdmin']}><CategoryManagement /></RouteGuard>} />
        <Route path="orders"               element={<OrderManagement />} />
        <Route path="users"                element={<RouteGuard roles={['superAdmin']}><UserManagement /></RouteGuard>} />
        <Route path="discounts"            element={<RouteGuard roles={['superAdmin']}><DiscountManagement /></RouteGuard>} />
        <Route path="companies"            element={<RouteGuard roles={['superAdmin']}><CompanyManagement /></RouteGuard>} />
        <Route path="company-profile"      element={<RouteGuard roles={['companyAdmin']}><CompanyProfilePage /></RouteGuard>} />
      </Route>

      {/* ── Storefront ── */}
      <Route path="/"               element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
      <Route path="/products"       element={<StorefrontLayout><ProductListingPage /></StorefrontLayout>} />
      <Route path="/products/:id"   element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
      <Route path="/cart"           element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
      <Route
        path="/checkout"
        element={
          <StorefrontLayout>
            <RouteGuard>
              <CheckoutPage />
            </RouteGuard>
          </StorefrontLayout>
        }
      />
      <Route path="/order-success"  element={<StorefrontLayout><OrderSuccessPage /></StorefrontLayout>} />
      <Route path="/store/:slug"    element={<StorefrontLayout><CompanyStorefrontPage /></StorefrontLayout>} />
      <Route
        path="/profile"
        element={
          <StorefrontLayout>
            <RouteGuard>
              <ProfilePage />
            </RouteGuard>
          </StorefrontLayout>
        }
      />

      {/* ── 404 ── */}
      <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
    </Routes>
  );
}
