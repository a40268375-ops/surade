import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  Calendar,
  Menu,
} from "lucide-react";

/**
 * Modern, Ergonomic Mobile Bottom Navigation Bar (< 900px)
 * Complete 5-Action Design:
 * 1. Beranda (Home)
 * 2. Cari Usaha (Directory / Search)
 * 3. + Usaha (Center Floating Action Button)
 * 4. Info & Event (Blog / Event)
 * 5. Menu (Drawer Trigger)
 */
export default function MobileBottomNav({
  user = null,
  inboxUnread = 0,
  onOpenMobileMenu = null,
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHomeActive = currentPath === "/";
  const isExploreActive = currentPath.startsWith("/category") || currentPath.startsWith("/categories") || currentPath === "/explore";
  const isBlogActive = currentPath.startsWith("/blog") || currentPath.startsWith("/event") || currentPath.startsWith("/events");

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 min-[900px]:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 transition-all pb-[max(0.4rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Beranda / Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 flex-1 ${
            isHomeActive
              ? "text-[#007570] font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-label="Beranda"
        >
          <Home size={20} strokeWidth={isHomeActive ? 2.5 : 1.8} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Beranda</span>
        </Link>

        {/* 2. Cari Usaha */}
        <Link
          to="/category"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 flex-1 ${
            isExploreActive
              ? "text-[#007570] font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-label="Cari Usaha"
        >
          <Search size={20} strokeWidth={isExploreActive ? 2.5 : 1.8} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Cari Usaha</span>
        </Link>

        {/* 3. Center Floating Action (+ Usaha) */}
        <Link
          to={user ? "/add-business" : "/login"}
          className="flex flex-col items-center justify-center group -mt-5 focus:outline-none px-1 shrink-0"
          aria-label="Tambah Usaha"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#007570] via-[#008983] to-[#00b3ab] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,117,112,0.45)] border-2 border-white ring-2 ring-emerald-500/20 active:scale-90 transition-transform">
            <Plus size={24} strokeWidth={2.8} />
          </div>
          <span className="text-[9.5px] font-extrabold text-[#007570] mt-0.5 tracking-tight">
            + Usaha
          </span>
        </Link>

        {/* 4. Info & Event */}
        <Link
          to="/blog"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 flex-1 ${
            isBlogActive
              ? "text-[#007570] font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-label="Info & Event"
        >
          <Calendar size={20} strokeWidth={isBlogActive ? 2.5 : 1.8} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold whitespace-nowrap">Info & Event</span>
        </Link>

        {/* 5. Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMobileMenu) onOpenMobileMenu();
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all duration-200 active:scale-95 bg-transparent border-none cursor-pointer flex-1"
          aria-label="Buka Menu"
        >
          <Menu size={20} strokeWidth={1.8} />
          <span className="text-[10px] mt-0.5 tracking-tight font-semibold">Menu</span>
        </button>
      </div>
    </nav>
  );
}
