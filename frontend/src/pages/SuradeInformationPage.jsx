import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SafeImage from "../components/SafeImage";
import SuradeLoader from "../components/SuradeLoader";
import api from "../services/api";
import {
  MapPin,
  Search,
  Info,
  BookOpen,
  ChevronRight,
  Sparkles,
  Building2,
  Megaphone,
  PhoneCall,
  Loader2,
  Filter,
} from "lucide-react";

const SuradeInformationPage = () => {
  const [informations, setInformations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    document.title = "Informasi & Potensi Desa Surade - Surade.com";
    fetchInformations();
  }, []);

  const fetchInformations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/surade-informations");
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setInformations(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat Informasi Surade:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Semua", "Profil Wilayah", "Desa / Kelurahan", "Pengumuman Warga", "Layanan Publik"];

  const filteredInformations = informations.filter((item) => {
    const matchCat =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.village_name && item.village_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Desa / Kelurahan":
        return <Building2 size={16} className="text-emerald-600" />;
      case "Pengumuman Warga":
        return <Megaphone size={16} className="text-amber-600" />;
      case "Layanan Publik":
        return <PhoneCall size={16} className="text-blue-600" />;
      default:
        return <Sparkles size={16} className="text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#064e3b] via-[#059669] to-[#0d9488] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/20">
            <MapPin size={14} className="text-amber-300" />
            <span>Pusat Informasi Terpadu Kecamatan Surade</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Informasi Desa, Wilayah &amp; Layanan Publik Surade
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
            Jelajahi profil desa, potensi ekonomi daerah, pengumuman warga, dan informasi penting publik se-Kecamatan Surade secara dinamis dan terverifikasi.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-2xl">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari desa, pengumuman, atau info wilayah..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-2">
            <Filter size={14} /> Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#059669] text-white shadow-md shadow-emerald-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Cards Grid */}
        {loading ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs my-4">
            <SuradeLoader
              variant="section"
              size="md"
              text="Memuat Informasi Surade"
              subtext="Mengambil direktori pengumuman, fasilitas, dan panduan publik di Surade"
              minHeight="180px"
            />
          </div>
        ) : filteredInformations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInformations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {getCategoryIcon(item.category)}
                      <span>{item.category || "Umum"}</span>
                    </span>
                    {item.village_name && (
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                        {item.village_name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span>Baca Selengkapnya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-slate-200">
            <Info size={40} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">Informasi Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada informasi Surade yang sesuai dengan kata kunci atau kategori yang Anda pilih.
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail Informasi */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {getCategoryIcon(selectedItem.category)}
                    <span>{selectedItem.category || "Umum"}</span>
                  </span>
                  {selectedItem.village_name && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {selectedItem.village_name}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="prose prose-slate text-sm leading-relaxed text-slate-700 space-y-3 font-normal whitespace-pre-line">
              {selectedItem.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Wilayah: {selectedItem.village_name || "Kecamatan Surade"}</span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuradeInformationPage;
