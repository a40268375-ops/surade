import { useEffect } from "react";

/**
 * useTabFaviconLoader
 * Dinonaktifkan: Tidak lagi memutar animasi canvas di tab browser favicon.
 * Memastikan favicon tab browser selalu statis menggunakan logo resmi /logo-surade.png.
 */
export default function useTabFaviconLoader() {
  useEffect(() => {
    try {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.head.appendChild(link);
      }
      if (link.getAttribute("href") !== "/logo-surade.png") {
        link.setAttribute("href", "/logo-surade.png");
      }
    } catch (e) {}
  }, []);
}
