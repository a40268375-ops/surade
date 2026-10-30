import React from "react";
import SuradeLoader from "./SuradeLoader";

/**
 * ArcDotsLoader Component
 * Dinonaktifkan: Animasi lengkungan titik (Chasing Arc Dots) telah dihapus
 * dan dialihkan ke SuradeLoader resmi yang elegan dan bersih.
 */
export default function ArcDotsLoader({
  size = "md",
  text = "Memuat data...",
  subtext,
  className = "",
  style = {},
  ...props
}) {
  return (
    <SuradeLoader
      variant="section"
      size={size}
      text={text}
      subtext={subtext}
      className={className}
      style={style}
      {...props}
    />
  );
}
