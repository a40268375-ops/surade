import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";
import Contact from "../pages/Contact";
import About from "../pages/About";
import VisionMission from "../pages/VisionMission";
import Terms from "../pages/Terms";
import PartnershipCareer from "../pages/PartnershipCareer";
import BusinessDetail from "../pages/BusinessDetail";
import Category from "../pages/Category";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import SmartCity from "../pages/SmartCity";
import LocationDetail from "../pages/LocationDetail";
import AdminUser from "../pages/admin-user/AdminUser";
import AddBusiness from "../pages/AddBusiness";
import AddBlog from "../pages/AddBlog";
import AddProduct from "../pages/AddProduct";
import AdminWeb from "../pages/admin-web/AdminWeb";

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
 * - If not authenticated, redirect to /login.
 * - If requiresRole is specified and user doesn't have it, redirect to appropriate dashboard.
 * - For admin routes, allow both 'admin' and 'super_admin' roles.
 * - For user routes, allow 'user', 'admin', or 'super_admin' roles.
 */
function ProtectedRoute({ children, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const user = getAuthUser();
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // For admin routes, allow both 'admin' and 'super_admin'
    // For user routes, allow 'user', 'admin', or 'super_admin'
    const hasAccess = requiredRole === "admin" 
      ? (user.role === "admin" || user.role === "super_admin")
      : (user.role === requiredRole || user.role === "admin" || user.role === "super_admin");
    
    if (!hasAccess) {
      // If admin tries to access user route, redirect to admin dashboard
      if (user.role === "admin" || user.role === "super_admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      // If user tries to access admin route, redirect to user dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/vision-mission" element={<VisionMission />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/partnership-career" element={<PartnershipCareer />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/smart-city/:id" element={<SmartCity />} />
        <Route path="/location/:slug" element={<LocationDetail />} />

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
          path="/admin-user"
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
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWeb />
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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
