import { useEffect, useRef, useState } from "react";

/**
 * useRepeatReveal
 * Beda dari useScrollReveal (yang cuma sekali muncul lalu diam selamanya),
 * hook ini akan menambah & MELEPAS class "is-revealed" setiap kali elemen
 * keluar-masuk area layar — jadi animasinya muncul lagi tiap kali di-scroll
 * lewat, baik dari atas ke bawah maupun sebaliknya.
 *
 * Pemakaian:
 *   const ref = useRepeatReveal();
 *   <div ref={ref} className="my-anim-class">...</div>
 */
export default function useRepeatReveal(options = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRevealed(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: options.rootMargin || "0px 0px -60px 0px",
        threshold: options.threshold ?? 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return [ref, isRevealed];
}