import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "./SuradeLoader.css";

/**
 * SuradeLoader - Desain Animasi Loading Premium Resmi Surade.com
 * - Logo Surade.com Resmi dengan Efek Kilau & Pernapasan 3D
 * - Cincin Gradasi Emerald-Gold Berputar Mulus (Concentric Spinner Ring)
 * - Titik Gelombang Animasi Dinamis (Bouncing Wave Dots)
 * - Gelombang Ripple & Ambient Glow Elegan
 */
export default function SuradeLoader({
  variant = "section",
  size,
  text = "Memuat data...",
  subtext = "Portal UMKM & Ekosistem Digital Surade",
  brandTitle = "Surade.com",
  isLoading = true,
  inline = false,
  fullscreen = false,
  showBrand = true,
  showProgress = false,
  progress = 0,
  boxed = false,
  className = "",
  minHeight,
  style = {},
}) {
  const [show, setShow] = useState(isLoading);
  const [animatedProgress, setAnimatedProgress] = useState(typeof progress === "number" && progress > 0 ? progress : 0);

  useEffect(() => {
    if (!isLoading) {
      setAnimatedProgress(100);
      const timer = setTimeout(() => setShow(false), 350);
      return () => clearTimeout(timer);
    }

    setShow(true);
    setAnimatedProgress(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setAnimatedProgress((prev) => {
        if (typeof progress === "number" && progress > 0) {
          return Math.min(100, progress);
        }
        if (prev < 25) return prev + Math.floor(Math.random() * 8) + 5;
        if (prev < 60) return prev + Math.floor(Math.random() * 6) + 4;
        if (prev < 85) return prev + Math.floor(Math.random() * 4) + 2;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, progress]);

  const currentPercent = Math.min(100, Math.max(0, typeof progress === "number" && progress > 0 ? progress : animatedProgress));

  if (!show) return null;

  const effectiveVariant = fullscreen ? "screen" : inline ? "inline" : variant;
  const cleanText = text ? String(text).replace(/\.+$/, "").trim() : "Memuat data";
  const stageSize = size || (effectiveVariant === "screen" ? "xl" : "md");

  // 1. INLINE SPINNER
  if (effectiveVariant === "inline") {
    return (
      <span
        className={`surade-loader-inline ${className}`}
        style={style}
        role="status"
        aria-label={cleanText}
      >
        <div className="surade-logo-stage surade-logo-stage--sm">
          <div className="surade-spinner-ring" />
          <div className="surade-logo-disc">
            <img src="/logo-surade.png" alt="Logo Surade" className="surade-official-logo" />
          </div>
        </div>
        <span className="surade-loader-inline__text">
          <span>{cleanText}</span>
          <span className="surade-dots-wave">
            <span className="surade-wave-dot" />
            <span className="surade-wave-dot" />
            <span className="surade-wave-dot" />
          </span>
        </span>
      </span>
    );
  }

  // 2. FULLSCREEN / SCREEN
  if (effectiveVariant === "screen") {
    return (
      <div
        className={`surade-loader-screen ${!isLoading ? "is-hidden" : ""} ${className}`}
        style={style}
        role="status"
        aria-label={cleanText}
      >
        <div className="surade-loader-bg-pattern">
          <div className="surade-loader-ambient-glow surade-loader-ambient-glow--top" />
          <div className="surade-loader-ambient-glow surade-loader-ambient-glow--bottom" />
          <div className="surade-loader-grid-mesh" />
        </div>

        <div className="surade-loader-screen-content">
          <div className="surade-logo-stage surade-logo-stage--xl">
            <div className="surade-ripple-wave" />
            <div className="surade-ripple-wave surade-ripple-wave--delayed" />
            <div className="surade-brand-aura" />
            <div className="surade-spinner-ring" />
            <div className="surade-logo-disc">
              <img src="/logo-surade.png" alt="Logo Surade.com" className="surade-official-logo" />
              <div className="surade-logo-sheen" />
            </div>
          </div>

          <div className="surade-loader-content">
            {showBrand && (
              <div className="surade-loader-brand">
                <span className="surade-brand-surade">Surade</span><span className="surade-brand-com">.com</span>
              </div>
            )}
            <div className="surade-loader-title">
              <span>{cleanText}</span>
              <span className="surade-dots-wave">
                <span className="surade-wave-dot" />
                <span className="surade-wave-dot" />
                <span className="surade-wave-dot" />
              </span>
            </div>
            {subtext && <p className="surade-loader-subtext">{subtext}</p>}
          </div>

          {showProgress && (
            <div className="surade-progress-container">
              <div className="surade-progress-track">
                <div
                  className="surade-progress-fill"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
              <div className="surade-progress-meta">
                <span>Sinkronisasi Data</span>
                <span>{Math.round(currentPercent)}%</span>
              </div>
            </div>
          )}

          <div className="surade-loader-footer-badge">
            <span>Official Portal Kecamatan Surade</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. SECTION / DEFAULT
  return (
    <div
      className={`surade-loader-section ${boxed ? "surade-loader-section--boxed" : ""} ${className}`}
      style={{
        minHeight: minHeight || "180px",
        ...style,
      }}
      role="status"
      aria-label={cleanText}
    >
      <div className={`surade-logo-stage surade-logo-stage--${stageSize}`}>
        <div className="surade-brand-aura" />
        <div className="surade-spinner-ring" />
        <div className="surade-logo-disc">
          <img src="/logo-surade.png" alt="Logo Surade" className="surade-official-logo" />
        </div>
      </div>
      <div className="surade-loader-content">
        <div className="surade-loader-title" style={{ fontSize: stageSize === "sm" ? "12px" : "14px" }}>
          <span>{cleanText}</span>
          <span className="surade-dots-wave">
            <span className="surade-wave-dot" />
            <span className="surade-wave-dot" />
            <span className="surade-wave-dot" />
          </span>
        </div>
        {subtext && (
          <p className="surade-loader-subtext" style={{ fontSize: stageSize === "sm" ? "11px" : "12px" }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export function SuradeInlineSpinner({ text = "Memuat", className = "" }) {
  return <SuradeLoader variant="inline" text={text} className={className} />;
}

export function SuradeArcSpinner({ text = "Memuat", className = "" }) {
  return <SuradeLoader variant="inline" text={text} className={className} />;
}

export function ArcDotsLoader({ text, className = "", size = "md" }) {
  return <SuradeLoader variant="inline" text={text} size={size} className={className} />;
}
