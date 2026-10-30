import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";
import Contact from "../pages/Contact";
import About from "../pages/About";
import VisionMission from "../pages/VisionMission";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Sitemap from "../pages/Sitemap";
import FAQ from "../pages/FAQ";
import PartnershipCareer from "../pages/PartnershipCareer";
import BusinessDetail from "../pages/BusinessDetail";
import BusinessProducts from "../pages/BusinessProducts";
import ProductDetail from "../pages/ProductDetail";
import Category from "../pages/Category";
import Panduan from "../pages/Panduan";
import NomorPenting from "../pages/NomorPenting";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Profile from "../pages/Profile";
import SmartCity from "../pages/SmartCity";
import Pricing from "../pages/Pricing";
import SellerProfile from "../pages/SellerProfile";
import PremiumWebsite from "../pages/PremiumWebsite";
import PremiumUpgrade from "../pages/PremiumUpgrade";
import OrderWebsite from "../pages/OrderWebsite";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailed from "../pages/PaymentFailed";
import AdminUser from "../pages/admin-user/AdminUser";
import AddBusiness from "../pages/AddBusiness";
import AddBlog from "../pages/AddBlog";
import AddProduct from "../pages/AddProduct";
import AdminWeb from "../pages/admin-web/AdminWeb";
import NotFound from "../pages/NotFound";
import LoadingDemo from "../pages/LoadingDemo";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import TopProgressBar from "../components/TopProgressBar";
import WelcomeBannerModal from "../components/WelcomeBannerModal";
import ScrollToTop from "../components/ScrollToTop";
import ScrollToTopButton from "../components/ScrollToTopButton";

/**
 * Get the currently authenticated user from localStorage.
 */
function getAuthUser() {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Checks if user is authenticated (has token).
 */
function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/**
 * ProtectedRoute:
 * - If not authenticated (no token or no user), redirect to /login.
 * - If requiredRole is 'admin': ONLY allow role === 'admin'. Users are redirected to /dashboard.
 * - If requiredRole is 'user': ONLY allow role === 'user'. Admins are redirected to /admin/dashboard.
 * This prevents any cross-contamination between admin and user sessions.
 */
function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getAuthUser();
  if (!user) {
    // Token exists but no user data — clear storage and go to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toLowerCase();

  if (requiredRole === "admin") {
    // Only strict admin role gets into admin web portal
    if (role !== "admin" && role !== "super_admin") {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (requiredRole === "user") {
    // Admins must go to admin dashboard
    if (role === "admin" || role === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // All normal user roles (user, seller, reseller, merchant, etc.) are allowed
  }

  return children;
}

function PageVisitTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const currentPath = location.pathname;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // Do not track admin panels or static assets to keep visitor stats purely portal visitor oriented
    if (currentPath.startsWith("/admin") || currentPath.startsWith("/admin-web")) {
      return;
    }

    try {
      // Extract business_id if on business detail page
      let businessId = null;
      const bizMatch = currentPath.match(/^\/business\/([^/?#]+)/);
      if (bizMatch && !isNaN(bizMatch[1])) {
        businessId = Number(bizMatch[1]);
      }

      api.post("/analytics/track", {
        path: currentPath,
        business_id: businessId,
      }).catch(() => {});
    } catch (e) {}
  }, [location.pathname]);

  return null;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <PageVisitTracker />
      <ScrollToTop />
      <TopProgressBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/event/:id" element={<BlogDetail />} />
        <Route path="/events/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/vision-mission" element={<VisionMission />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/kebijakan-privasi" element={<PrivacyPolicy />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/peta-situs" element={<Sitemap />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/partnership-career" element={<PartnershipCareer />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/business/:id/products" element={<BusinessProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/business/:businessId/product/:id" element={<ProductDetail />} />
        <Route path="/category" element={<Category />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/categories/:categoryId" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/smart-city" element={<SmartCity />} />
        <Route path="/smart-city/:id" element={<SmartCity />} />
        <Route path="/smart-village" element={<SmartCity />} />
        <Route path="/smart-village/:id" element={<SmartCity />} />
        <Route path="/location/:slug" element={<SmartCity />} />
        <Route path="/panduan" element={<Panduan />} />
        <Route path="/nomor-penting" element={<NomorPenting />} />
        <Route path="/nomor-darurat" element={<NomorPenting />} />
        <Route path="/darurat" element={<NomorPenting />} />
        <Route path="/emergency" element={<NomorPenting />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route path="/premium-website" element={<PremiumWebsite />} />
        <Route path="/premium-upgrade" element={<PremiumUpgrade />} />
        <Route path="/order-website/:id" element={<OrderWebsite />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/loading-demo" element={<LoadingDemo />} />

        {/* User Routes (accessible by role 'user', 'admin', or 'super_admin') */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inbox"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-user"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-user/:tab"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <ProtectedRoute requiredRole="user">
              <AdminUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-business"
          element={
            <ProtectedRoute requiredRole="user">
              <AddBusiness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-business/:id"
          element={
            <ProtectedRoute requiredRole="user">
              <AddBusiness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-blog"
          element={
            <ProtectedRoute requiredRole="user">
              <AddBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-blog/:id"
          element={
            <ProtectedRoute requiredRole="user">
              <AddBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute requiredRole="user">
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product/:businessId"
          element={
            <ProtectedRoute requiredRole="user">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes (only accessible by role 'admin' or 'super_admin') */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWeb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/:tab"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWeb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWeb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-business"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddBusiness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-web"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWeb />
            </ProtectedRoute>
          }
        />
        {/* Halaman 404 — WAJIB paling bawah, menangkap semua URL
            yang tidak cocok dengan route mana pun di atas. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <WelcomeBannerModal />
      <ScrollToTopButton />
      <FloatingWhatsApp />
    </BrowserRouter>
  );
}

export default AppRouter;