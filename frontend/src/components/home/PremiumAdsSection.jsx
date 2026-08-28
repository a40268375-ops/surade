import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";
import { getStorageUrl } from "../../utils/constants";

const DEFAULT_PREMIUM_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=800&fit=crop&q=80";

export default function PremiumAdsSection({ ads = [], loading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const activeAds = ads.length > 0 ? ads : [];

  // Autoplay (5s interval)
  useEffect(() => {
    if (loading || activeAds.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeAds.length, loading, isHovered]);

  const handlePrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  const handleNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <section className="premium-ads-section">
        <div className="premium-ads-container">
          <div className="premium-ad-skeleton animate-pulse">
            <div className="premium-ad-skeleton__content">
              <div className="h-6 w-28 bg-slate-700/60 rounded-full mb-4" />
              <div className="h-10 w-3/4 sm:w-1/2 bg-slate-700/60 rounded-lg mb-3" />
              <div className="h-5 w-32 bg-slate-700/60 rounded mb-2" />
              <div className="h-4 w-48 bg-slate-700/60 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (activeAds.length === 0) return null;

  return (
    <section 
      className="premium-ads-section" 
      aria-label="Premium Advertisements"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="premium-ads-container">
        <div className="premium-ads-slider">
          {activeAds.map((ad, idx) => {
            const isActive = idx === currentIndex;
            const targetUrl = `/business/${ad.business_id || ad.businessId || ad.id}`;
            const bgImage = getStorageUrl(ad.image || ad.banner || ad.logo || ad.business?.banner || ad.business?.logo) || DEFAULT_PREMIUM_IMG;
            const ratingValue = ad.rating ? Number(ad.rating).toFixed(1) : "4.8";
            const locationText = ad.location || (ad.city ? (ad.province ? `${ad.city}, ${ad.province}` : ad.city) : "Indonesia");

            return (
              <div
                key={`prem-ad-${ad.id}-${idx}`}
                className={`premium-ad-slide ${isActive ? "active" : ""}`}
                aria-hidden={!isActive}
              >
                <Link to={targetUrl} className="premium-ad-link" tabIndex={isActive ? 0 : -1}>
                  {/* Full-bleed Background Image */}
                  <img
                    src={bgImage}
                    alt={ad.name || "Premium Business"}
                    className="premium-ad-bg"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />

                  {/* Sleek Gradient Overlay */}
                  <div className="premium-ad-overlay" />

                  {/* Minimalist Content */}
                  <div className="premium-ad-content">
                    {/* Sponsored / Premium Badge */}
                    <div className="premium-ad-badge">
                      <Sparkles size={13} className="text-amber-300" />
                      <span>Sponsored</span>
                      <span className="premium-ad-badge__dot">•</span>
                      <span className="text-amber-200 font-semibold">Premium</span>
                    </div>

                    {/* Nama Usaha */}
                    <h2 className="premium-ad-title">
                      {ad.name}
                    </h2>

                    {/* Rating & Lokasi Minimalis */}
                    <div className="premium-ad-meta">
                      <div className="premium-ad-rating">
                        <Star size={17} className="fill-amber-400 text-amber-400" />
                        <span className="premium-ad-rating__val">{ratingValue}</span>
                        {ad.rating_count ? (
                          <span className="premium-ad-rating__count">({ad.rating_count} ulasan)</span>
                        ) : null}
                      </div>

                      <div className="premium-ad-location">
                        <MapPin size={16} className="text-teal-300 flex-shrink-0" />
                        <span>{locationText}</span>
                      </div>
                    </div>

                    {/* Subtle Action Pill */}
                    <div className="premium-ad-action">
                      <span>Lihat Profil Usaha</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Navigation Arrows (discreet on desktop) */}
          {activeAds.length > 1 && (
            <>
              <button
                type="button"
                className="premium-ad-nav premium-ad-nav--prev"
                onClick={handlePrev}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="premium-ad-nav premium-ad-nav--next"
                onClick={handleNext}
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>

              {/* Minimal Pagination Dots */}
              <div className="premium-ad-dots">
                {activeAds.map((_, dotIdx) => (
                  <button
                    key={`dot-${dotIdx}`}
                    type="button"
                    className={`premium-ad-dot ${dotIdx === currentIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(dotIdx);
                    }}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
