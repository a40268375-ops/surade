import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component:
 * Automatically resets window scroll position to (0, 0) whenever route path or search changes.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Clear home scroll pos cache so Home always starts at top
    try {
      sessionStorage.removeItem("home_scroll_pos");
    } catch (e) {}

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname, search]);

  return null;
}
