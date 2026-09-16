import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";
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
  /* Side thumbnails: pick OTHER ads that are not currently main.
     If total ≤ 2, just show the remaining.
     If only 1 ad, show 2 placeholder slots. */
  const sideAds = activeAds.filter((_, i) => i !== currentIndex).slice(0, 2);

  /* ── Autoplay every 5 s ── */
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeAds.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 5000);
  };

  useEffect(() => {
    if (!loading && !isHovered) startTimer();
    return () => clearInterval(timerRef.current);
  }, [activeAds.length, loading, isHovered]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
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

  /* ── Empty ── */
  if (activeAds.length === 0) return null;

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
        <div className="prem-ads-main">
          <div className="prem-ads-main__track">
            {activeAds.map((ad, idx) => {
              const isActive = idx === currentIndex;
              const bgImg = getAdImg(ad, FALLBACK_MAIN);
              const logoImg = getAdLogoImg(ad);
              const rating = ad.rating ? Number(ad.rating).toFixed(1) : "0.0";
              const loc =
                ad.location ||
                (ad.city ? (ad.province ? `${ad.city}, ${ad.province}` : ad.city) : "Surade");
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
                          <span className="prem-ads-main__source">{ad.name}</span>
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
                      <h2 className="prem-ads-main__title">{ad.name}</h2>

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

          {/* Nav Arrows */}
          {activeAds.length > 1 && (
            <>
              <button
                type="button"
                className="prem-ads-main__nav prem-ads-main__nav--prev"
                onClick={handlePrev}
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="prem-ads-main__nav prem-ads-main__nav--next"
                onClick={handleNext}
                aria-label="Berikutnya"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div className="prem-ads-main__dots">
                {activeAds.map((_, dotIdx) => (
                  <button
                    key={`dot-${dotIdx}`}
                    type="button"
                    className={`prem-ads-main__dot${dotIdx === currentIndex ? " active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(dotIdx); }}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                ))}
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
              /* Empty slot → show "Pasang Iklan" placeholder */
              return (
                <Link
                  key={`side-empty-${sIdx}`}
                  to="/dashboard?tab=iklan"
                  className="prem-ads-empty"
                  style={{ textDecoration: "none" }}
                >
                  + Pasang Iklan Premium
                </Link>
              );
            }

            const sImg = getAdImg(sAd, FALLBACK_SIDE[sIdx] || FALLBACK_MAIN);
            const sLogo = getAdLogoImg(sAd);
            const sRating = sAd.rating ? Number(sAd.rating).toFixed(1) : "0.0";
            const sLoc =
              sAd.location ||
              (sAd.city ? (sAd.province ? `${sAd.city}, ${sAd.province}` : sAd.city) : "Surade");
            const sTarget = `/business/${sAd.business_id || sAd.businessId || sAd.id}`;

            return (
              <div key={`side-${sAd.id}-${sIdx}`} className="prem-ads-thumb">
                <Link to={sTarget}>
                  <img
                    src={sImg}
                    alt={sAd.name || "Premium Ad"}
                    className="prem-ads-thumb__img"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = FALLBACK_SIDE[sIdx] || FALLBACK_MAIN; }}
                  />
                  <div className="prem-ads-thumb__overlay" />
                  <div className="prem-ads-thumb__content">
                    <span className="prem-ads-thumb__tag">Special Offer</span>

                    {sLogo && (
                      <div className="prem-ads-thumb__logo-row">
                        <img
                          src={sLogo}
                          alt={sAd.name}
                          className="prem-ads-thumb__logo"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <span className="prem-ads-thumb__source">{sAd.name}</span>
                      </div>
                    )}

                    <div className="prem-ads-thumb__title">{sAd.name}</div>

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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
