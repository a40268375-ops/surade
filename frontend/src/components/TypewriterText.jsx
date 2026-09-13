import { useEffect, useRef, useState } from "react";
import "./TypewriterText.css";

/**
 * Menampilkan teks dengan animasi "mengetik" (satu huruf muncul satu-satu),
 * yang baru mulai jalan begitu elemen ini masuk ke area layar (scroll into
 * view) — dipakai misalnya untuk judul "Cepat dan Memudahkan Pencarian" di
 * Home.jsx.
 *
 * Props:
 *  - text      : teks yang mau diketik
 *  - speed     : kecepatan ketik per huruf (ms), default 35ms
 *  - startDelay: jeda sebelum mulai ngetik (ms), default 150ms
 *  - as        : elemen HTML pembungkus, default "span"
 */
export default function TypewriterText({ text, speed = 35, startDelay = 150, as: Tag = "span", className = "", repeat = false }) {
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  // Mulai animasi begitu elemen terlihat di layar.
  // Jika `repeat` aktif, animasi direset & diulang tiap kali elemen
  // keluar-masuk area layar (baik scroll ke bawah maupun ke atas).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true);
            if (!repeat) obs.unobserve(entry.target);
          } else if (repeat) {
            // Keluar dari layar: reset supaya animasi ngetik ulang dari awal
            // saat elemen terlihat lagi.
            setStarted(false);
            setDisplayed("");
            setDone(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [repeat]);

  // Jalankan efek ketik huruf demi huruf.
  useEffect(() => {
    if (!started) return;

    let i = 0;
    let intervalId;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(intervalId);
    };
  }, [started, text, speed, startDelay]);

  return (
    <Tag ref={containerRef} className={`typewriter-text ${className}`}>
      {displayed}
      <span className={`typewriter-cursor ${done ? "typewriter-cursor--done" : ""}`}>|</span>
    </Tag>
  );
}