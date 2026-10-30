import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArcLoaderShowcase from "../components/ArcLoaderShowcase";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoadingDemo() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
          <span className="text-xs text-slate-500 font-mono">
            Komponen: ArcDotsLoader.jsx
          </span>
        </div>

        <ArcLoaderShowcase />
      </main>

      <Footer />
    </div>
  );
}
