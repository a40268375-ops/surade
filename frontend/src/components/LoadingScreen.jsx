import React from "react";
import SuradeLoader, { SuradeInlineSpinner } from "./SuradeLoader";
import ArcDotsLoader from "./ArcDotsLoader";

export { default as ArcDotsLoader } from "./ArcDotsLoader";

/**
 * Full-screen loading Surade.com.
 * Mengikuti progress loading secara dinamis dengan animasi logo Surade.
 */
export default function LoadingScreen({
  isLoading,
  progress,
  text = "Surade.com",
  subtext = "Direktori UMKM & Potensi Wilayah Surade",
}) {
  return (
    <SuradeLoader
      variant="screen"
      isLoading={isLoading}
      progress={progress}
      brandTitle={text}
      text="Memuat data..."
      subtext={subtext}
      showBrand
      showProgress
    />
  );
}

/**
 * Inline loading spinner berbasis logo Surade untuk komponen saat fetch data lokal/kartu
 */
export function InlineSpinner({ text = "Memuat data...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 ${className}`}>
      <SuradeLoader
        variant="section"
        size="md"
        text={text}
        minHeight="140px"
      />
    </div>
  );
}

/**
 * Inline loading spinner berbasis busur titik berputar (Arc Dots) modern
 */
export function ArcInlineSpinner({ text = "Memuat data...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <SuradeLoader
        variant="section"
        size="md"
        text={text}
      />
    </div>
  );
}