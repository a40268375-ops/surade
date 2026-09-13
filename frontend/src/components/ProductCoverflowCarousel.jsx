import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/**
 * Carousel 3D "coverflow" — kartu tengah besar & tajam, kartu kiri/kanan
 * mengecil & agak gelap membentuk efek melengkung ala coverflow iTunes.
 * Dipakai untuk menampilkan katalog produk & layanan di BusinessDetail.jsx.
 *
 * items: array of { img, titleLine1, titleLine2, desc, tag, ctaText, onCta }
 */
export default function ProductCoverflowCarousel({
  items = [],
  sectionLabel = "KATALOG PRODUK",
  autoplay = true,
  autoplayDelay = 5000,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx) => setCurrentIndex(idx % total);

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className="relative w-full min-h-[620px] flex items-center justify-center overflow-hidden py-10 select-none rounded-2xl"
      style={{ backgroundColor: "#ffffff", color: "#0a1a17" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background polos putih, menyatu dengan kartu induk */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ backgroundColor: "#ffffff" }} />

      <div className="relative w-full max-w-5xl mx-auto px-4 z-10 flex flex-col items-center">
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-6">
            <span style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, #00c9b1)" }} />
            <h3 style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#00c9b1", margin: 0 }}>
              {sectionLabel}
            </h3>
            <span style={{ width: 36, height: 1, background: "linear-gradient(90deg, #00c9b1, transparent)" }} />
          </div>
        )}

        {/* Panggung 3D */}
        <div className="relative w-full h-[420px] flex justify-center items-center mb-7" style={{ perspective: "1400px" }}>
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1; zIndex = 30; filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(230px) scale(0.82) rotateY(-24deg)";
              opacity = 0.6; zIndex = 20; filter = "brightness(0.7)";
            } else if (offset === 2) {
              transform = "translateX(410px) scale(0.66) rotateY(-38deg)";
              opacity = 0.32; zIndex = 10; filter = "brightness(0.5) blur(1px)";
            } else if (offset === total - 1) {
              transform = "translateX(-230px) scale(0.82) rotateY(24deg)";
              opacity = 0.6; zIndex = 20; filter = "brightness(0.7)";
            } else if (offset === total - 2) {
              transform = "translateX(-410px) scale(0.66) rotateY(38deg)";
              opacity = 0.32; zIndex = 10; filter = "brightness(0.5) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute", width: 270, height: 400, borderRadius: 18, overflow: "hidden",
                  backgroundColor: "#0f2622", border: "1px solid rgba(255,255,255,0.12)",
                  transform, opacity, zIndex, filter, transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter ? "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0,201,177,0.22)" : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { 
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='270' height='400'%3E%3Crect width='270' height='400' fill='%230f2622'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%2300c9b1'%3EProduk%3C/text%3E%3C/svg%3E"; 
                  }}
                />

                <div
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.68) 62%, rgba(0,0,0,0.96) 100%)",
                    pointerEvents: "none", zIndex: 10,
                  }}
                />

                <div
                  style={{
                    position: "relative", width: "100%", height: "100%", padding: "16px 16px 18px",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", textAlign: "center", zIndex: 20,
                    opacity: isCenter ? 1 : 0, transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {item.tag && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
                      {item.tag}
                    </span>
                  )}

                  <h2 style={{ fontSize: "1.15rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em", color: "#fff", margin: 0, lineHeight: 1.2, textShadow: "0 3px 12px rgba(0,0,0,0.95)" }}>
                    {item.titleLine1}
                  </h2>

                  {item.titleLine2 && (
                    <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#5eead4", lineHeight: 1.3, marginTop: 2 }}>
                      {item.titleLine2}
                    </span>
                  )}

                  <div style={{ width: 30, height: 2, backgroundColor: "#00c9b1", borderRadius: 2, margin: "8px auto 8px", boxShadow: "0 0 8px rgba(0,201,177,0.7)" }} />

                  {item.desc && (
                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", maxWidth: 230, margin: "0 auto 10px", lineHeight: 1.35 }}>
                      {item.desc}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => item.onCta && item.onCta()}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 9999, border: "none",
                      background: "linear-gradient(135deg, #00c9b1 0%, #007570 100%)",
                      color: "#08201c", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em",
                      textTransform: "uppercase", cursor: "pointer", margin: "0 auto",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.4), 0 0 15px rgba(0,201,177,0.3)",
                    }}
                  >
                    <span>{item.ctaText || "Lihat Detail"}</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Produk sebelumnya"
              className="hidden sm:flex"
              style={{
                position: "absolute", left: 4, top: "42%", transform: "translateY(-50%)",
                width: 42, height: 42, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)", color: "#fff", alignItems: "center",
                justifyContent: "center", backdropFilter: "blur(8px)", cursor: "pointer", zIndex: 40,
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Produk berikutnya"
              className="hidden sm:flex"
              style={{
                position: "absolute", right: 4, top: "42%", transform: "translateY(-50%)",
                width: 42, height: 42, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)", color: "#fff", alignItems: "center",
                justifyContent: "center", backdropFilter: "blur(8px)", cursor: "pointer", zIndex: 40,
              }}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 30 }}>
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Ke produk ${idx + 1}`}
                  style={{
                    height: 8, width: idx === currentIndex ? 26 : 8, borderRadius: 9999,
                    backgroundColor: idx === currentIndex ? "#00c9b1" : "rgba(10,26,23,0.18)",
                    border: "none", cursor: "pointer",
                    boxShadow: idx === currentIndex ? "0 0 10px rgba(0,201,177,0.7)" : "none",
                    transition: "all 300ms ease",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}