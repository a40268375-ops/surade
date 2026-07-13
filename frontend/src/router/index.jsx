import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Dashboard from "../pages/Dashboard";

// === IMPORT COMPONENT ADMIN ===
import UserManagement from '../pages/admin/UserManagement';
import ResellerManagement from '../pages/admin/ResellerManagement';
import CategoryManagement from '../pages/admin/CategoryManagement'; 
import EventManagement from '../pages/admin/EventManagement'; // <- Ditambahkan

// === IMPORT LAYOUT NAVIGASI ADMIN ===
import AdminLayout from '../pages/admin/AdminLayout'; // <- Ditambahkan

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTE PUBLIC / UMUM */}
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
        <Route path="/dashboard" element={<Dashboard />} />

        {/* RUTE ADMIN (Semua dibungkus AdminLayout agar menu sidebar muncul) */}
        <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/resellers" element={<AdminLayout><ResellerManagement /></AdminLayout>} />
        <Route path="/admin/events" element={<AdminLayout><EventManagement /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;