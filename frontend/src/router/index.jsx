import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";
import BlogCreate from "../pages/BlogCreate";
import EventDetail from "../pages/EventDetail";
import Contact from "../pages/Contact";
import About from "../pages/About";
import VisionMission from "../pages/VisionMission";
import Terms from "../pages/Terms";
import FAQ from "../pages/FAQ";
import PartnershipCareer from "../pages/PartnershipCareer";
import BusinessDetail from "../pages/BusinessDetail";
import Category from "../pages/Category";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOtp from "../pages/VerifyOtp";
import Profile from "../pages/Profile";
import SmartCity from "../pages/SmartCity";
import Dashboard from "../pages/Dashboard";
import ForgotPassword from "../pages/ForgotPassword";
import Pricing from "../pages/Pricing";
import PremiumWebsite from "../pages/PremiumWebsite";
import PremiumUpgrade from "../pages/PremiumUpgrade";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailed from "../pages/PaymentFailed";
import OrderWebsite from "../pages/OrderWebsite";
import SellerProfile from "../pages/SellerProfile";

// === IMPORT COMPONENT ADMIN ===
import UserManagement from '../pages/Admin/UserManagement';
import ResellerManagement from '../pages/Admin/ResellerManagement';
import CategoryManagement from '../pages/Admin/CategoryManagement';
import EventManagement from '../pages/Admin/EventManagement';
import BusinessManagement from '../pages/Admin/BusinessManagement';
import ReferralManagement from '../pages/Admin/ReferralManagement';
import ReportManagement from '../pages/Admin/ReportManagement';

// === IMPORT LAYOUT NAVIGASI ADMIN ===
import AdminLayout from '../pages/Admin/AdminLayout';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTE PUBLIC / UMUM */}
        <Route path="/" element={<Home />} />
        {/* Blog & Event digabung jadi satu halaman (/blog), dengan tab
            Semua/Blog/Event di dalamnya - lihat Blog.jsx. Rute /events
            (tanpa id) dialihkan ke /blog supaya link/bookmark lama masih
            jalan; halaman detail /events/:id tetap ada karena tetap
            dibutuhkan buat lihat detail 1 event. */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/blog/create" element={<BlogCreate />} />
        <Route path="/events" element={<Navigate to="/blog" replace />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/vision-mission" element={<VisionMission />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/partnership-career" element={<PartnershipCareer />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/smart-city/:id" element={<SmartCity />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/premium-website" element={<PremiumWebsite />} />
        <Route path="/premium-upgrade" element={<PremiumUpgrade />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/order-website/:id" element={<OrderWebsite />} />
        <Route path="/seller/:id" element={<SellerProfile />} />

        {/* RUTE ADMIN (Semua dibungkus AdminLayout agar menu sidebar muncul) */}
        <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/resellers" element={<AdminLayout><ResellerManagement /></AdminLayout>} />
        <Route path="/admin/referrals" element={<AdminLayout><ReferralManagement /></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><EventManagement /></AdminLayout>} />
        <Route path="/admin/businesses" element={<AdminLayout><BusinessManagement /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><ReportManagement /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;