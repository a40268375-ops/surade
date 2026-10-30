import { useEffect } from "react";

/**
 * useScrollReveal
 * Automatically observes elements with '.reveal-on-scroll', '.reveal-card',
 * '.reveal-from-left', '.reveal-from-right', or section animation classes
 * and reveals them smoothly as the user scrolls.
 */
export default function useScrollReveal(dependencies = []) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SELECTORS = ".reveal-on-scroll, .reveal-card, .reveal-from-left, .reveal-from-right";
    const IN_VIEW_SELECTORS = ".quick-section, .sawah-wave-divider, .home-features-section";

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(SELECTORS).forEach((el) => el.classList.add("is-revealed"));
      document.querySelectorAll(IN_VIEW_SELECTORS).forEach((el) => el.classList.add("is-in-view"));
      return;
    }

    // Observer for reveal-on-scroll elements (one-shot)
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -45px 0px", threshold: 0.06 }
    );

    // Observer for section animations (adds is-in-view class)
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
    );

    const timeoutId = setTimeout(() => {
      // Handle reveal elements
      const elements = document.querySelectorAll(SELECTORS);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
          el.classList.add("is-revealed");
        } else {
          observer.observe(el);
        }
      });

      // Handle section animations
      document.querySelectorAll(IN_VIEW_SELECTORS).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add("is-in-view");
        } else {
          sectionObserver.observe(el);
        }
      });
    }, 60);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, dependencies);
}
