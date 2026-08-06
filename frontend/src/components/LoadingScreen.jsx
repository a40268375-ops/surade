import { useState, useEffect } from "react";
import "./LoadingScreen.css";

export default function LoadingScreen({ isLoading, text = "Memuat..." }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Delay hiding to allow fade-out transition
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
    setShow(true);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div className={`loading-screen ${!isLoading ? "loading-screen--hidden" : ""}`}>
      <div className="loading-logo">
        <div className="loading-ring" />
        <span className="loading-logo__i">i</span>
        <span className="loading-logo__dot" />
      </div>
      <p className="loading-text">
        {text}
        <span className="loading-dots" />
      </p>
    </div>
  );
}

/**
 * Inline loading spinner for use inside components (e.g. while fetching data).
 * Same "i" logo animation but smaller.
 */
export function InlineSpinner({ text = "Memuat..." }) {
  return (
    <div className="loading-spinner-inline">
      <div className="loading-logo">
        <div className="loading-ring" />
        <span className="loading-logo__i">i</span>
        <span className="loading-logo__dot" />
      </div>
      <p className="loading-text">
        {text}
        <span className="loading-dots" />
      </p>
    </div>
  );
}

