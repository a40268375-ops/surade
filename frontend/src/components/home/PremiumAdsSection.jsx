import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Star, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight,
  Crown, Megaphone, ShieldCheck, Zap, TrendingUp, Store
} from "lucide-react";
import { getStorageUrl } from "../../utils/constants";
import "./PremiumAdsSection.css";

/* ── Fallback images (beda2 per slot agar tidak monoton) ── */
const FALLBACK_MAIN =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=500&fit=crop&q=80";
const FALLBACK_SIDE = [
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=420&h=300&fit=crop&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=420&h=300&fit=crop&q=80",
];

function getAdImg(ad, fallback) {
  return (
    getStorageUrl(ad.image || ad.banner || ad.logo) ||
    getStorageUrl(ad.business?.banner || ad.business?.logo) ||
    fallback
  );
}

function getAdLogoImg(ad) {
  return getStorageUrl(ad.logo) || getStorageUrl(ad.business?.logo) || null;
}

function StarIcon({ filled = true }) {
  return (
    <Star size={14} className={filled ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
  );
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════ */
export default function PremiumAdsSection({ ads = [], loading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef(null);

  /* ── Only show premium/hero ads ── */
  const activeAds = ads.length > 0 ? ads : [];
  const mainAd = activeAds[currentIndex] || null;

  /* ── Dynamically rotate side ads in sequence based on currentIndex ── */
  const getSideAds = () => {
    if (activeAds.length <= 1) return [];
    if (activeAds.length === 2) {
      return [activeAds[(currentIndex + 1) % activeAds.length]];
    }
    const firstSide = activeAds[(currentIndex + 1) % activeAds.length];
    const secondSide = activeAds[(currentIndex + 2) % activeAds.length];
    return [firstSide, secondSide];
  };

  const sideAds = getSideAds();

  /* ── Automatic 6.5-second Slider Timer (Pauses on Hover & Interaction) ── */
  useEffect(() => {
    if (activeAds.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAds.length, isHovered, currentIndex]);

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  };

  const handleTouchStart = (e) => (touchStartX.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div className="prem-ads-wrap">
        <div className="prem-ads-grid">
          <div className="prem-ads-skeleton-main" />
          <div className="prem-ads-side">
            <div className="prem-ads-skeleton-thumb" />
            <div className="prem-ads-skeleton-thumb" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty (Desain Elegan, Non-Tacky, Modern UI/UX) ── */
  if (activeAds.length === 0) {
    return (
      <section className="prem-ads-wrap" aria-label="Ruang Promosi Eksklusif">
        <div className="prem-ads-header">
          <div className="prem-ads-header__left">
            <span className="prem-ads-header__dot" />
            <span className="prem-ads-header__label">Ruang Promosi &amp; Mitra Terverifikasi</span>
          </div>
          <span className="prem-ads-header__badge">
            <Sparkles size={11} />
            Spotlight Pilihan
          </span>
        </div>
        
        <div className="prem-ads-grid">
          {/* MAIN (Kiri) - Hero Promo Banner */}
          <div className="prem-ads-hero-promo">
            <div className="prem-ads-hero-promo__backdrop" />
            
            <div className="prem-ads-hero-promo__content">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-sm">
                  <Crown size={13} strokeWidth={2.5} />
                  <span>SLOT PROMOSI UTAMA</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 backdrop-blur-xs">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>Jangkauan Ribuan Pengunjung / Bulan</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2.5 tracking-tight">
                Tingkatkan Penjualan &amp; Kenalkan Bisnis Anda di Surade
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-5 max-w-xl">
                Tempatkan banner promosi usaha Anda di posisi paling strategis portal Surade.com. Dapatkan visibilitas prioritas, terhubung langsung ke WhatsApp &amp; peta lokasi usaha Anda.
              </p>

              {/* Value proposition badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white">
                  <Zap size={14} className="text-amber-400 shrink-0" />
                  <span>Prioritas No. 1 Beranda</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Badge Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white">
                  <TrendingUp size={14} className="text-cyan-400 shrink-0" />
                  <span>Statistik Klik Realtime</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/admin-user?tab=iklan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all text-decoration-none"
                >
                  <Megaphone size={16} />
                  <span>Pasang Iklan Sekarang</span>
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  to="/panduan#iklan-banner"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all text-decoration-none"
                >
                  <span>Pelajari Panduan &amp; Tarif</span>
                </Link>
              </div>
            </div>
          </div>

          {/* SIDEBAR (Kanan) - 2 cards */}
          <div className="prem-ads-side">
            {/* Card 1: Slot Banner Hero */}
            <Link
              to="/admin-user?tab=iklan"
              className="prem-ads-side-promo group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  <Crown size={11} className="text-amber-600" />
                  Slot Banner Hero
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#007570]/10 group-hover:bg-[#007570] text-[#007570] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#007570] transition-colors mb-1">
                Banner Eksklusif Halaman Depan
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Tampil menonjol di bagian atas beranda dengan tautan langsung ke katalog produk &amp; nomor WhatsApp usaha.
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Mulai promosi</span>
                <span className="text-[#007570] font-bold group-hover:underline">Pilih Slot Ini &rarr;</span>
              </div>
            </Link>

            {/* Card 2: Tambah Usaha Baru */}
            <Link
              to="/add-business"
              className="prem-ads-side-promo group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Store size={11} className="text-emerald-600" />
                  Daftar Usaha Baru
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#007570]/10 group-hover:bg-[#007570] text-[#007570] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#007570] transition-colors mb-1">
                Buka Etalase Usaha Anda
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Belum terdaftar di portal Surade.com? Daftarkan usaha UMKM Anda secara mudah &amp; gratis hari ini.
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Gratis selamanya</span>
                <span className="text-[#007570] font-bold group-hover:underline">Daftar Sekarang &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="prem-ads-wrap"
      aria-label="Iklan Premium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── HEADER ── */}
      <div className="prem-ads-header">
        <div className="prem-ads-header__left">
          <span className="prem-ads-header__dot" />
          <span className="prem-ads-header__label">Iklan Premium</span>
        </div>
        <span className="prem-ads-header__badge">
          <Sparkles size={11} />
          Sponsored
        </span>
      </div>

      {/* ── GRID: MAIN + SIDE ── */}
      <div className="prem-ads-grid">
        {/* ─── LEFT: MAIN SLIDER ─── */}
        <div
          className="prem-ads-main"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="prem-ads-main__track">
            {activeAds.map((ad, idx) => {
              const isActive = idx === currentIndex;
              const bgImg = getAdImg(ad, FALLBACK_MAIN);
              const logoImg = getAdLogoImg(ad);
              const rating = ad.rating ? Number(ad.rating).toFixed(1) : "0.0";
              const rawLoc =
                ad.location ||
                (ad.city ? (ad.province ? `${ad.city}, ${ad.province}` : ad.city) : "Surade");
              const loc = rawLoc.length > 24 ? rawLoc.split(",")[0].trim() : rawLoc;
              const target = `/business/${ad.business_id || ad.businessId || ad.id}`;

              return (
                <div
                  key={`main-${ad.id}-${idx}`}
                  className={`prem-ads-main__slide${isActive ? " active" : ""}`}
                  aria-hidden={!isActive}
                >
                  <Link to={target} tabIndex={isActive ? 0 : -1}>
                    {/* BG image */}
                    <img
                      src={bgImg}
                      alt={ad.name || "Premium Ad"}
                      className="prem-ads-main__img"
                      loading={idx === 0 ? "eager" : "lazy"}
                      onError={(e) => { e.currentTarget.src = FALLBACK_MAIN; }}
                    />

                    {/* Overlay */}
                    <div className="prem-ads-main__overlay" />

                    {/* Content */}
                    <div className="prem-ads-main__content">
                      {/* Logo row */}
                      {logoImg && (
                        <div className="prem-ads-main__logo-row">
                          <img
                            src={logoImg}
                            alt={ad.name}
                            className="prem-ads-main__logo"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          <span className="prem-ads-main__source">Bisnis Terverifikasi</span>
                        </div>
                      )}

                      {/* Badge row */}
                      <div className="prem-ads-main__badge-row">
                        <span className="prem-ads-main__tag prem-ads-main__tag--sponsored">
                          Special Offer
                        </span>
                        <span className="prem-ads-main__tag prem-ads-main__tag--premium">
                          ✦ Premium
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="prem-ads-main__title">
                        {ad.business?.name || (ad.name ? ad.name.replace(/\s*-\s*Iklan.*$/i, '') : "Bisnis")}
                      </h2>

                      {/* Description */}
                      {ad.description && (
                        <p className="prem-ads-main__desc">{ad.description}</p>
                      )}

                      {/* Meta */}
                      <div className="prem-ads-main__meta">
                        <div className="prem-ads-main__rating">
                          <StarIcon />
                          <span>{rating}</span>
                          {ad.rating_count ? (
                            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
                              ({ad.rating_count} ulasan)
                            </span>
                          ) : null}
                        </div>
                        <div className="prem-ads-main__location">
                          <MapPin size={14} />
                          <span>{loc}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="prem-ads-main__cta">
                        <span>Lihat Profil Usaha</span>
                        <ArrowUpRight size={15} />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Nav & Dots Controls */}
          {activeAds.length > 1 && (
            <>
              {/* Floating Side Arrows (Desktop & Mobile) */}
              <button
                type="button"
                className="prem-ads-main__nav prem-ads-main__nav--prev"
                onClick={handlePrev}
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="prem-ads-main__nav prem-ads-main__nav--next"
                onClick={handleNext}
                aria-label="Berikutnya"
              >
                <ChevronRight size={22} />
              </button>

              {/* Dots Pagination */}
              <div className="prem-ads-main__dots">
                {activeAds.map((_, dotIdx) => {
                  const isActiveDot = dotIdx === currentIndex;
                  return (
                    <button
                      key={`dot-${dotIdx}`}
                      type="button"
                      className={`prem-ads-main__dot${isActiveDot ? " active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(dotIdx);
                      }}
                      aria-label={`Slide ${dotIdx + 1}`}
                    >
                      {isActiveDot && (
                        <span
                          key={`prog-${currentIndex}`}
                          className="prem-ads-main__dot-progress"
                          style={{ animationPlayState: isHovered ? "paused" : "running" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ─── RIGHT: THUMBNAIL GRID ─── */}
        <div className="prem-ads-side">
          {/* Show up to 2 side thumbnails */}
          {Array.from({ length: 2 }).map((_, sIdx) => {
            const sAd = sideAds[sIdx] || null;

            if (!sAd) {
              /* Empty slot → show clean modern promo card */
              return (
                <Link
                  key={`side-empty-${sIdx}`}
                  to="/admin-user?tab=iklan"
                  className="prem-ads-side-promo prem-ads-side-promo--empty group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                      <Sparkles size={11} className="text-amber-600" />
                      Slot Tersedia
                    </span>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-[#007570] transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#007570] transition-colors mb-1">
                    Pasang Iklan Banner Anda
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Tampilkan promosi bisnis Anda di slot rekomendasi ini.
                  </p>
                </Link>
              );
            }

            const sImg = getAdImg(sAd, FALLBACK_SIDE[sIdx] || FALLBACK_MAIN);
            const sLogo = getAdLogoImg(sAd);
            const sRating = sAd.rating ? Number(sAd.rating).toFixed(1) : "0.0";
            const rawLoc = sAd.location || sAd.city || "Surade";
            const sLoc = rawLoc.split(",")[0].trim();
            const sTargetBizId = sAd.business_id || sAd.businessId || (sAd.business?.id) || sAd.id;
            const sTarget = `/business/${sTargetBizId}`;

            return (
              <Link
                key={`side-${sAd.id}-${sIdx}`}
                to={sTarget}
                className="prem-ads-thumb group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`Buka profil ${sAd.name || "Bisnis"}`}
              >
                <img
                  src={sImg}
                  alt={sAd.name || "Premium Ad"}
                  className="prem-ads-thumb__img"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = FALLBACK_SIDE[sIdx] || FALLBACK_MAIN; }}
                />
                <div className="prem-ads-thumb__overlay" />
                <div className="prem-ads-thumb__content">
                  <div className="flex items-center justify-between mb-1">
                    <span className="prem-ads-thumb__tag">Special Offer</span>
                    <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-0.5 opacity-90 group-hover:opacity-100 group-hover:underline">
                      Lihat Profil <ArrowUpRight size={13} />
                    </span>
                  </div>

                  {sLogo && (
                    <div className="prem-ads-thumb__logo-row">
                      <img
                        src={sLogo}
                        alt={sAd.name}
                        className="prem-ads-thumb__logo"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  )}

                  <div className="prem-ads-thumb__title">
                    {sAd.business?.name || (sAd.name ? sAd.name.replace(/\s*-\s*Iklan.*$/i, '') : "Bisnis")}
                  </div>

                  <div className="prem-ads-thumb__meta">
                    <div className="prem-ads-thumb__rating">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{sRating}</span>
                    </div>
                    <div className="prem-ads-thumb__location">
                      <MapPin size={11} />
                      <span>{sLoc}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
