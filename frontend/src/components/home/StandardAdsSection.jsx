import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Sparkles } from "lucide-react";
import { getStorageUrl } from "../../utils/constants";

const DEFAULT_STANDARD_IMG = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=350&fit=crop&q=80";

export default function StandardAdsSection({ ads = [], loading = false }) {
  // Ensure enough items for a seamless continuous ticker loop
  const tickerItems = useMemo(() => {
    if (!ads || ads.length === 0) return [];
    if (ads.length < 5) {
      return [...ads, ...ads, ...ads, ...ads, ...ads, ...ads];
    } else if (ads.length < 10) {
      return [...ads, ...ads, ...ads];
    }
    return [...ads, ...ads];
  }, [ads]);

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
                className="w-[220px] sm:w-[250px] flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="h-32 sm:h-36 bg-slate-200 animate-pulse" />
                <div className="p-3 space-y-2.5">
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

  if (ads.length === 0) return null;

  return (
    <section className="standard-ads-section" aria-label="Standard Advertisements">
      <div className="standard-ads-container">
        {/* Subtle Minimal Header */}
        <div className="standard-ads-header">
          <div className="standard-ads-header__badge">
            <Sparkles size={13} className="text-teal-600" />
            <span>Iklan Terverifikasi</span>
          </div>
          <span className="standard-ads-header__hint">Mitra Pilihan Surade.co.id</span>
        </div>

        {/* Continuous Horizontal Scrolling Ticker Track */}
        <div className="standard-ads-ticker-wrap">
          <div className="standard-ads-ticker-track">
            {tickerItems.map((ad, idx) => {
              const targetUrl = `/business/${ad.business_id || ad.businessId || ad.id}`;
              const cardImage = getStorageUrl(ad.image || ad.banner || ad.logo || ad.business?.banner || ad.business?.logo) || DEFAULT_STANDARD_IMG;
              const ratingValue = ad.rating ? Number(ad.rating).toFixed(1) : "0.0";
              const cityName = ad.city || (ad.location ? ad.location.split(",")[0].trim() : "Indonesia");

              return (
                <Link
                  key={`std-ad-${ad.id}-${idx}`}
                  to={targetUrl}
                  className="standard-ad-card"
                >
                  {/* Photo Usaha */}
                  <div className="standard-ad-card__img-wrap">
                    <img
                      src={cardImage}
                      alt={ad.name || "Business"}
                      className="standard-ad-card__img"
                      loading="lazy"
                    />
                    <div className="standard-ad-card__tag">Iklan</div>
                  </div>

                  {/* Info Usaha Minimal */}
                  <div className="standard-ad-card__body">
                    <h3 className="standard-ad-card__name" title={ad.name}>
                      {ad.name}
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
          </div>
        </div>
      </div>
    </section>
  );
}
