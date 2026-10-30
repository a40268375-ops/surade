import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

/**
 * Google reCAPTCHA v2 Checkbox Component ("I'm not a robot")
 * Menggunakan library resmi Google https://www.google.com/recaptcha/api.js
 * Site Key: 6LcA-QcuAAAAAD44nH_o7QzPZO9CE88PkDbEGLRh
 *
 * Fix: robust grecaptcha.ready() waiting — mengatasi race condition antara
 * script di index.html dan React component mount.
 */
const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcA-QcuAAAAAD44nH_o7QzPZO9CE88PkDbEGLRh";

const SCRIPT_ID = "google-recaptcha-v2-script";
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit&hl=id";

/** Memuat script reCAPTCHA jika belum ada, lalu memanggil callback saat siap. */
function loadRecaptchaScript(onReady, onError) {
  // Jika grecaptcha sudah tersedia dan siap
  if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
    window.grecaptcha.ready(() => onReady());
    return;
  }

  // Jika script tag sudah ada di DOM (dari index.html), tunggu dengan polling
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    const poll = setInterval(() => {
      if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        clearInterval(poll);
        window.grecaptcha.ready(() => onReady());
      }
    }, 80);
    // Timeout 10 detik
    const timeout = setTimeout(() => {
      clearInterval(poll);
      onError("Gagal memuat Google reCAPTCHA. Silakan muat ulang halaman.");
    }, 10000);
    // Simpan timeout agar bisa dibersihkan
    existingScript._cleanupTimeout = timeout;
    existingScript._cleanupPoll = poll;
    return;
  }

  // Inject script baru jika belum ada sama sekali
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => onReady());
    } else {
      onError("Google reCAPTCHA tidak dapat dimuat. Periksa koneksi internet Anda.");
    }
  };
  script.onerror = () => {
    onError("Gagal memuat Google reCAPTCHA. Silakan periksa koneksi internet Anda.");
  };
  document.head.appendChild(script);
}

const CaptchaInput = forwardRef(function CaptchaInput(
  {
    id = "recaptcha-widget",
    label = "Verifikasi Keamanan",
    value = "",
    onChange,
    error = "",
    className = "",
    theme = "light",
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Ekspos reset & getResponse ke parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      try {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      } catch (err) {
        console.warn("reCAPTCHA reset:", err);
      }
      if (onChange) onChange("");
    },
    getResponse: () => {
      try {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        }
      } catch (err) {
        console.warn("reCAPTCHA getResponse:", err);
      }
      return "";
    },
  }));

  // Step 1: Tunggu grecaptcha siap
  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    setIsReady(false);

    loadRecaptchaScript(
      () => {
        if (!cancelled) setIsReady(true);
      },
      (errMsg) => {
        if (!cancelled) setLoadError(errMsg);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Step 2: Render widget setelah siap
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    let mounted = true;

    const renderWidget = () => {
      if (!mounted || !containerRef.current) return;

      // Jangan re-render jika sudah ada widget
      if (widgetIdRef.current !== null) return;

      try {
        // Bersihkan sisa HTML lama
        containerRef.current.innerHTML = "";

        const wId = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: theme,
          size: "normal",
          callback: (token) => {
            if (onChange) onChange(token);
          },
          "expired-callback": () => {
            if (onChange) onChange("");
          },
          "error-callback": () => {
            if (onChange) onChange("");
            setLoadError("Terjadi kesalahan reCAPTCHA. Silakan coba lagi.");
          },
        });

        widgetIdRef.current = wId;
      } catch (err) {
        // Widget sudah di-render di container ini (error "already rendered")
        // Abaikan, ini normal saat React Strict Mode double-invoke effects
        if (!String(err).includes("already rendered")) {
          console.warn("reCAPTCHA render error:", err);
        }
      }
    };

    window.grecaptcha.ready(renderWidget);

    return () => {
      mounted = false;
      // Reset dan bersihkan widget saat unmount
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [isReady, theme, onChange]);

  return (
    <div className={`recaptcha-wrapper ${className}`} style={{ marginTop: 6, marginBottom: 12 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.74rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#334155",
            marginBottom: 6,
          }}
        >
          <ShieldCheck size={14} style={{ color: "#0d9488", flexShrink: 0 }} />
          <span>{label}</span>
          <span style={{ color: "#ef4444" }}>*</span>
        </label>
      )}

      {/* Kontainer reCAPTCHA responsif */}
      <div
        style={{
          minHeight: 78,
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "2px 0",
        }}
      >
        {/* Loading Spinner */}
        {!isReady && !loadError && (
          <div
            style={{
              width: 304,
              height: 78,
              borderRadius: 4,
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.78rem",
              color: "#6b7280",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid #0d9488",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "recaptcha-spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            <span>Memuat reCAPTCHA...</span>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div
            style={{
              width: 304,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #fca5a5",
              backgroundColor: "#fef2f2",
              fontSize: "0.75rem",
              color: "#b91c1c",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoadError("");
                setIsReady(false);
                widgetIdRef.current = null;
                if (containerRef.current) containerRef.current.innerHTML = "";
                setRetryCount((prev) => prev + 1);
              }}
              style={{
                alignSelf: "flex-start",
                padding: "3px 8px",
                borderRadius: 4,
                backgroundColor: "#fee2e2",
                border: "1px solid #f87171",
                color: "#991b1b",
                fontWeight: 600,
                fontSize: "0.72rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <RefreshCw size={11} /> Coba Muat Ulang
            </button>
          </div>
        )}

        {/* DOM node tempat Google reCAPTCHA v2 dirender */}
        <div
          id={id}
          ref={containerRef}
          style={{
            display: isReady && !loadError ? "block" : "none",
            transformOrigin: "0 0",
          }}
        />
      </div>

      {/* Pesan error validasi */}
      {error && (
        <span
          style={{
            color: "#ef4444",
            fontSize: "0.75rem",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 600,
          }}
        >
          <AlertCircle size={12} />
          {error}
        </span>
      )}

      {/* Animasi spinner */}
      <style>{`
        @keyframes recaptcha-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

export default CaptchaInput;
