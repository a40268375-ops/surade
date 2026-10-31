import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Gift,
  Crown,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PromoAdsSlider({
  className = "",
  isSeller: propIsSeller = null,
  onTabChange = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Deteksi status penjual (seller) secara akurat
  const isSeller = Boolean(
    propIsSeller !== null
      ? propIsSeller
      : (user?.role === "seller" ||
         user?.role === "reseller" ||
         user?.role === "merchant" ||
         user?.role === "admin" ||
         user?.role === "super_admin" ||
         user?.is_seller === true ||
         user?.account_type === "seller" ||
         user?.account_type === "reseller" ||
         user?.account_type === "business" ||
         (Array.isArray(user?.businesses) && user.businesses.length > 0)) &&
        user?.account_type !== "personal"
  );

  const promoAds = [
    {
      id: "create-business",
      badge: "✨ 100% GRATIS SELAMANYA",
      badgeBg: "bg-emerald-400 text-slate-950 border border-emerald-300 shadow-sm",
      icon: Store,
      title: "Promosikan Usaha Anda",
      description:
        "Daftarkan toko dan produk Anda di Surade untuk menjangkau ribuan calon pembeli lokal setiap hari.",
      ctaText: "Daftarkan Usaha Gratis Sekarang",
      targetTab: null,
      requiresSeller: false,
      gradient: "from-[#032e2a] via-[#00635e] to-[#01403b]",
      accentColor: "text-emerald-300",
    },
    {
      id: "share-referral",
      badge: "💰 BONUS KOMISI TUNAI",
      badgeBg: "bg-indigo-300 text-slate-950 border border-indigo-200 shadow-sm",
      icon: Gift,
      title: "Ajak Teman dan Dapatkan Cuan",
      description:
        "Bagikan link undangan referral Anda ke rekan pedagang dan nikmati komisi bagi hasil yang langsung cair.",
      ctaText: "Ambil Kode Referral Anda",
      targetTab: "referral",
      requiresSeller: false,
      gradient: "from-[#1e1b4b] via-[#3730a3] to-[#1e1b4b]",
      accentColor: "text-indigo-200",
    },
    {
      id: "upgrade-premium",
      badge: "👑 CENTANG EMAS RESMI",
      badgeBg: "bg-amber-400 text-slate-950 border border-amber-300 shadow-sm",
      icon: Crown,
      title: "Tingkatkan Penjualan Toko Anda",
      description:
        "Dapatkan lencana Centang Emas resmi, katalog produk tanpa batas, dan prioritas tampil di urutan teratas pencarian.",
      ctaText: "Lihat Paket Centang Emas",
      targetTab: "premium",
      requiresSeller: true,
      gradient: "from-[#7c2d12] via-[#c2410c] to-[#431407]",
      accentColor: "text-amber-300",
    },
    {
      id: "advertise-business",
      badge: "🔥 BANNER PROMOSI TERATAS",
      badgeBg: "bg-pink-300 text-slate-950 border border-pink-200 shadow-sm",
      icon: Sparkles,
      title: "Pasang Iklan Banner Premium",
      description:
        "Tampilkan banner usaha Anda di posisi paling strategis halaman utama agar langsung dilihat seluruh warga Surade.",
      ctaText: "Pasang Iklan Banner Sekarang",
      targetTab: "iklan",
      requiresSeller: true,
      gradient: "from-[#831843] via-[#9f1239] to-[#4c0519]",
      accentColor: "text-pink-200",
    },
    {
      id: "publish-event-info",
      badge: "📢 PUBLIKASI INFO DAN ACARA",
      badgeBg: "bg-cyan-300 text-slate-950 border border-cyan-200 shadow-sm",
      icon: Calendar,
      title: "Publikasikan Agenda dan Event",
      description:
        "Punya agenda bazaar promo, lowongan kerja, atau event lokal? Publikasikan secara resmi ke seluruh masyarakat.",
      ctaText: "Publikasikan Event Sekarang",
      targetTab: "blog-event",
      requiresSeller: true,
      gradient: "from-[#0c4a6e] via-[#0369a1] to-[#082f49]",
      accentColor: "text-cyan-200",
    },
  ];

  const total = promoAds.length;

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleActionClick = (ad) => {
    // 1. Jika tombol pendaftaran usaha ("create-business")
    if (ad.id === "create-business") {
      navigate("/add-business");
      return;
    }

    // 2. Cek apakah pengguna sudah login
    if (!user) {
      const redirectPath = ad.targetTab ? `/dashboard?tab=${ad.targetTab}` : "/add-business";
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    // 3. Jika fitur memerlukan status Penjual (Seller) dan akun masih User Biasa, langsung arahkan menjadi penjual
    if (ad.requiresSeller && !isSeller) {
      navigate("/add-business");
      return;
    }

    // 4. Jika pengguna adalah Penjual (atau fitur umum seperti referral)
    if (ad.targetTab) {
      if (typeof onTabChange === "function") {
        onTabChange(ad.targetTab);
      } else {
        navigate(`/dashboard?tab=${ad.targetTab}`);
      }
    } else {
      navigate("/add-business");
    }
  };

  const activeAd = promoAds[currentSlide];
  const IconComponent = activeAd.icon;

  return (
    <div
      className={`promo-ads-slider relative rounded-3xl overflow-hidden select-none transition-all duration-300 shadow-xl border border-white/10 ${className}`}
      style={{
        boxShadow: "0 16px 36px -10px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.35)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main 3D Card Background */}
      <div
        className={`w-full px-10 py-5 bg-gradient-to-br ${activeAd.gradient} text-white transition-all duration-500 relative flex flex-col justify-between min-h-[250px] overflow-hidden`}
      >
        {/* Background 3D Glow Orbs */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl pointer-events-none opacity-40 bg-white"
        />
        <div
          className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-xl pointer-events-none opacity-50 bg-black"
        />

        {/* ── VERTICAL CENTER 3D NAVIGATION ARROWS (< and >) ── */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide Sebelumnya"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white backdrop-blur-md border border-white/30 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          title="Slide Sebelumnya"
        >
          <ChevronLeft size={18} strokeWidth={2.5} className="mr-0.5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide Selanjutnya"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white backdrop-blur-md border border-white/30 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          title="Slide Selanjutnya"
        >
          <ChevronRight size={18} strokeWidth={2.5} className="ml-0.5" />
        </button>

        {/* ── TOP HEADER ROW: Badge + Counter ── */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider ${activeAd.badgeBg} transition-all duration-300`}
          >
            {activeAd.badge}
          </span>
          
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-black text-white/95 border border-white/20">
            <span>{currentSlide + 1}</span>
            <span className="text-white/50">/</span>
            <span>{total}</span>
          </div>
        </div>

        {/* ── MIDDLE CONTENT: Icon + Title + Description ── */}
        <div className="my-3 space-y-1.5 relative z-10 text-left">
          <div className="flex items-start gap-3">
            {/* 3D Glass Icon Container */}
            <div
              className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 shadow-sm flex items-center justify-center mt-0.5"
            >
              <IconComponent size={20} className={activeAd.accentColor} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
                {activeAd.title}
              </h4>
              <p className="text-xs text-white/90 leading-relaxed mt-1">
                {activeAd.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: 3D Tactile CTA Button ── */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={() => handleActionClick(activeAd)}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer border-0 flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:shadow-black/30 group"
          >
            <span>{activeAd.ctaText}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ── PAGINATION DOTS: 3D Centered Indicator ── */}
        <div className="flex items-center justify-center gap-1.5 pt-3 relative z-10">
          {promoAds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 ${
                idx === currentSlide
                  ? "w-6 bg-white shadow-xs"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
