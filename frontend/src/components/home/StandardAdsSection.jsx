import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Sparkles, ArrowUpRight, TrendingUp, ShieldCheck } from "lucide-react";
import { getStorageUrl } from "../../utils/constants";
import InfiniteScroller from "./InfiniteScroller";

const DEFAULT_STANDARD_IMG = "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&h=350&fit=crop&q=80";

const PLACEHOLDER_AD_SLOTS = [
  {
    id: "slot-kuliner",
    category: "Kuliner & Cafe",
    badge: "Spotlight UMKM",
    title: "Promosikan Kuliner Anda",
    desc: "Jangkau ribuan penikmat kuliner & wisatawan di Surade setiap hari.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=320&fit=crop&q=80",
    stats: "Trafik Tinggi",
    action: "Pesan Slot Ini"
  },
  {
    id: "slot-wisata",
    category: "Wisata & Stay",
    badge: "Destinasi Populer",
    title: "Homestay & Wisata Lokal",
    desc: "Dapatkan reservasi langsung dari wisatawan luar daerah yang berkunjung.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=320&fit=crop&q=80",
    stats: "Rekomendasi Utama",
    action: "Pesan Slot Ini"
  },
  {
    id: "slot-jasa",
    category: "Jasa & Layanan",
    badge: "Kebutuhan Warga",
    title: "Jasa & Keahlian Usaha",
    desc: "Bantu warga menemukan bengkel, laundry, salon & layanan terpercaya Anda.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=320&fit=crop&q=80",
    stats: "Cepat Terhubung",
    action: "Pesan Slot Ini"
  },
  {
    id: "slot-oleholeh",
    category: "Oleh-Oleh Khas",
    badge: "Produk Lokal",
    title: "Produk Khas & Kerajinan",
    desc: "Tingkatkan omzet olahan kelapa, cemilan, dan cinderamata khas Surade.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=320&fit=crop&q=80",
    stats: "Katalog Pilihan",
    action: "Pesan Slot Ini"
  },
  {
    id: "slot-retail",
    category: "Toko & Fashion",
    badge: "Etalase Bisnis",
    title: "Toko Fashion & Retail",
    desc: "Tampilkan promo toko pakaian, elektronik, & kebutuhan harian warga.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=320&fit=crop&q=80",
    stats: "Peluang Penjualan",
    action: "Pesan Slot Ini"
  },
  {
    id: "slot-agri",
    category: "Hasil Bumi & Tani",
    badge: "Komoditas Lokal",
    title: "Pertanian & Bahari Surade",
    desc: "Hubungkan pasokan hasil tani, perikanan & perkebunan ke pasar luas.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&h=320&fit=crop&q=80",
    stats: "Pasar Luas",
    action: "Pesan Slot Ini"
  }
];

export default function StandardAdsSection({ ads = [], loading = false }) {
  const isPlaceholderMode = !ads || ads.length === 0;

  // Base list of items (replicate if few so width is sufficient for smooth infinite wrap)
  const baseItems = useMemo(() => {
    const source = isPlaceholderMode ? PLACEHOLDER_AD_SLOTS : ads;
    if (source.length < 4) {
      return [...source, ...source, ...source];
    } else if (source.length < 7) {
      return [...source, ...source];
    }
    return source;
  }, [ads, isPlaceholderMode]);

  if (loading) {
    return (
      <section className="standard-ads-section">
        <div className="standard-ads-container">
          <div className="standard-ads-header">
            <div className="h-5 w-36 bg-slate-200 rounded animate-pulse mb-4" />
          </div>
          <div className="flex gap-4 overflow-hidden py-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={`std-skel-${n}`}
                className="w-[230px] sm:w-[250px] flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="h-32 sm:h-36 bg-slate-200 animate-pulse" />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="standard-ads-section" aria-label="Standard Advertisements">
      <div className="standard-ads-container">
        {/* Header */}
        <div className="standard-ads-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="standard-ads-header__badge">
              <Sparkles size={13} className="text-teal-600" />
              <span>{isPlaceholderMode ? "Slot Usaha Pilihan" : "Usaha Pilihan"}</span>
            </div>
            {isPlaceholderMode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded-full border border-emerald-200/60">
                <ShieldCheck size={12} /> Buka Promosi Bisnis Anda
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin-user?tab=iklan"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors ml-1"
            >
              <span>{isPlaceholderMode ? "+ Pasang Iklan Anda" : "Mitra Pilihan Surade.com"}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Seamless Infinite Scroller (Bisa digeser sendiri tanpa batas & auto-scroll) */}
        <InfiniteScroller
          speed={1.0}
          direction="left"
          gap={16}
          className="standard-ads-ticker-wrap py-5"
        >
          {isPlaceholderMode
            ? baseItems.map((slot, idx) => (
                <Link
                  key={`std-slot-${slot.id}-${idx}`}
                  to="/admin-user?tab=iklan"
                  className="standard-ad-card standard-ad-card--slot group shrink-0"
                  title={`Pesan Slot Iklan: ${slot.category}`}
                >
                  {/* Visual Mockup Header */}
                  <div className="standard-ad-card__img-wrap relative">
                    <img
                      src={slot.image}
                      alt={slot.title}
                      className="standard-ad-card__img group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-600/90 text-white text-[10px] font-semibold backdrop-blur-md shadow-sm">
                      <Sparkles size={10} />
                      <span>{slot.category}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/85 text-amber-300 text-[10px] font-bold border border-amber-400/30 backdrop-blur-md">
                      {slot.badge}
                    </div>

                    {/* Bottom Image Stats */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10.5px]">
                      <span className="flex items-center gap-1 text-teal-200 font-medium">
                        <TrendingUp size={11} /> {slot.stats}
                      </span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/95 backdrop-blur-sm font-medium">
                        Slot Tersedia
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-bold text-slate-800 text-[13px] leading-snug group-hover:text-teal-600 transition-colors">
                        {slot.title}
                      </h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                        {slot.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1 group-hover:text-teal-800">
                        {slot.action}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-teal-50 group-hover:bg-teal-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            : baseItems.map((ad, idx) => {
                const targetUrl = `/business/${ad.business_id || ad.businessId || ad.id}`;
                const cardImage =
                  getStorageUrl(ad.image || ad.banner || ad.logo || ad.business?.banner || ad.business?.logo) ||
                  DEFAULT_STANDARD_IMG;
                const ratingValue = ad.rating ? Number(ad.rating).toFixed(1) : "0.0";
                const cityName = ad.city || (ad.location ? ad.location.split(",")[0].trim() : "Indonesia");

                return (
                  <Link
                    key={`std-ad-${ad.id}-${idx}`}
                    to={targetUrl}
                    className="standard-ad-card group shrink-0"
                  >
                    {/* Photo Usaha */}
                    <div className="standard-ad-card__img-wrap">
                      <img
                        src={cardImage}
                        alt={ad.name || "Business"}
                        className="standard-ad-card__img group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_STANDARD_IMG;
                        }}
                      />
                      <div className="standard-ad-card__tag">Iklan</div>
                    </div>

                    {/* Info Usaha Minimal */}
                    <div className="standard-ad-card__body">
                      <h3 className="standard-ad-card__name" title={ad.business?.name || ad.name}>
                        {ad.business?.name || (ad.name ? ad.name.replace(/\s*-\s*Iklan.*$/i, '') : "Bisnis")}
                      </h3>

                      <div className="standard-ad-card__meta">
                        <div className="standard-ad-card__rating">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{ratingValue}</span>
                        </div>

                        <span className="standard-ad-card__dot">•</span>

                        <div className="standard-ad-card__location" title={cityName}>
                          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{cityName}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </InfiniteScroller>
      </div>
    </section>
  );
}
