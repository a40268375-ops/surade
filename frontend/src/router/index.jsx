import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Blog from "../pages/Blog";
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
import AdminUser from "../pages/AdminUser";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
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
        <Route path="/admin-user" element={<AdminUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;