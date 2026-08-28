import { useEffect } from "react";

/**
 * useScrollReveal
 * Automatically observes elements with '.reveal-on-scroll', '.reveal-card',
 * '.reveal-from-left', or '.reveal-from-right' and reveals them smoothly as the user scrolls.
 */
export default function useScrollReveal(dependencies = []) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".reveal-on-scroll, .reveal-card, .reveal-from-left, .reveal-from-right")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -45px 0px",
        threshold: 0.06,
      }
    );

    // Timeout ensures DOM elements from dynamic queries / data have rendered
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(
        ".reveal-on-scroll, .reveal-card, .reveal-from-left, .reveal-from-right"
      );

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
          el.classList.add("is-revealed");
        } else {
          observer.observe(el);
        }
      });
    }, 60);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, dependencies);
}
