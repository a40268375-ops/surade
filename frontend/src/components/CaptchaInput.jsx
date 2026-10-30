import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Google reCAPTCHA v2 Checkbox Component ("I'm not a robot")
 * Menggunakan library resmi Google https://www.google.com/recaptcha/api.js
 * Site Key: 6LcA-QcuAAAAAD44nH_o7QzPZO9CE88PkDbEGLRh
 *
 * Fix:
 * - Ganti <label htmlFor> → <div> agar tidak ada warning "label for doesn't match"
 * - Polling robust untuk menunggu grecaptcha siap (race condition fix)
 * - Tantangan gambar muncul otomatis oleh Google jika dianggap perlu (perilaku resmi)
 */
const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcA-QcuAAAAAD44nH_o7QzPZO9CE88PkDbEGLRh";

const SCRIPT_ID = "google-recaptcha-v2-script";
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit&hl=id";

/** Memuat script reCAPTCHA, lalu memanggil onReady saat siap */
function loadRecaptchaScript(onReady, onError) {
  // Sudah siap langsung
  if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
    window.grecaptcha.ready(onReady);
    return;
  }

  // Script sudah ada di DOM (dari index.html), tunggu dengan polling
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    let elapsed = 0;
    const poll = setInterval(() => {
      elapsed += 80;
      if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        clearInterval(poll);
        window.grecaptcha.ready(onReady);
      } else if (elapsed >= 10000) {
        clearInterval(poll);
        onError("Gagal memuat Google reCAPTCHA. Silakan muat ulang halaman.");
      }
    }, 80);
    return;
  }

  // Inject script baru
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(onReady);
    } else {
      onError("Google reCAPTCHA tidak dapat dimuat. Periksa koneksi internet.");
    }
  };
  script.onerror = () => {
    onError("Gagal memuat Google reCAPTCHA. Periksa koneksi internet Anda.");
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
  const [isVerified, setIsVerified] = useState(false);

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
      setIsVerified(false);
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
    setIsVerified(false);

    loadRecaptchaScript(
      () => { if (!cancelled) setIsReady(true); },
      (errMsg) => { if (!cancelled) setLoadError(errMsg); }
    );

    return () => { cancelled = true; };
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
        containerRef.current.innerHTML = "";

        const wId = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: theme,
          size: "normal",
          callback: (token) => {
            setIsVerified(true);
            if (onChange) onChange(token);
          },
          "expired-callback": () => {
            setIsVerified(false);
            if (onChange) onChange("");
          },
          "error-callback": () => {
            setIsVerified(false);
            if (onChange) onChange("");
          },
        });

        widgetIdRef.current = wId;
      } catch (err) {
        if (!String(err).includes("already rendered")) {
          console.warn("reCAPTCHA render error:", err);
        }
      }
    };

    window.grecaptcha.ready(renderWidget);

    return () => {
      mounted = false;
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [isReady, theme, onChange]);

  // Sync isVerified saat value dari luar direset
  useEffect(() => {
    if (!value) setIsVerified(false);
  }, [value]);

  return (
    <div className={`recaptcha-wrapper ${className}`} style={{ marginTop: 6, marginBottom: 12 }}>

      {/* ── Label: gunakan <div> bukan <label htmlFor> agar tidak ada browser warning ── */}
      {label && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.74rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#334155",
            marginBottom: 8,
            userSelect: "none",
          }}
        >
          <ShieldCheck size={14} style={{ color: "#0d9488", flexShrink: 0 }} />
          <span>{label}</span>
          <span style={{ color: "#ef4444" }}>*</span>
          {isVerified && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              color: "#059669", fontSize: "0.68rem", fontWeight: 600,
              background: "#ecfdf5", padding: "1px 7px", borderRadius: 99,
              border: "1px solid #bbf7d0", marginLeft: 4,
            }}>
              <CheckCircle2 size={11} /> Terverifikasi
            </span>
          )}
        </div>
      )}

      {/* ── Area widget reCAPTCHA ── */}
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
        {/* Loading */}
        {!isReady && !loadError && (
          <div style={{
            width: 304, height: 78, borderRadius: 4,
            border: "1px solid #d1d5db", backgroundColor: "#f9fafb",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, fontSize: "0.78rem", color: "#6b7280",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 16, height: 16,
              border: "2px solid #0d9488", borderTopColor: "transparent",
              borderRadius: "50%", animation: "recaptcha-spin 0.8s linear infinite",
              flexShrink: 0,
            }} />
            <span>Memuat reCAPTCHA...</span>
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div style={{
            width: 304, padding: "10px 12px", borderRadius: 6,
            border: "1px solid #fca5a5", backgroundColor: "#fef2f2",
            fontSize: "0.75rem", color: "#b91c1c",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoadError("");
                setIsReady(false);
                setIsVerified(false);
                widgetIdRef.current = null;
                if (containerRef.current) containerRef.current.innerHTML = "";
                setRetryCount((prev) => prev + 1);
              }}
              style={{
                alignSelf: "flex-start", padding: "3px 8px", borderRadius: 4,
                backgroundColor: "#fee2e2", border: "1px solid #f87171",
                color: "#991b1b", fontWeight: 600, fontSize: "0.72rem",
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
              }}
            >
              <RefreshCw size={11} /> Coba Muat Ulang
            </button>
          </div>
        )}

        {/* DOM target reCAPTCHA v2 widget */}
        <div
          id={`${id}-container`}
          ref={containerRef}
          aria-label="Google reCAPTCHA verifikasi keamanan"
          role="region"
          style={{
            display: isReady && !loadError ? "block" : "none",
            transformOrigin: "0 0",
          }}
        />
      </div>

      {/* Error validasi form */}
      {error && (
        <span style={{
          color: "#ef4444", fontSize: "0.75rem", marginTop: 4,
          display: "flex", alignItems: "center", gap: 4, fontWeight: 600,
        }}>
          <AlertCircle size={12} />
          {error}
        </span>
      )}

      {/* Catatan: tantangan gambar muncul otomatis oleh Google jika dianggap perlu */}
      {isReady && !loadError && !isVerified && (
        <p style={{
          fontSize: "0.65rem", color: "#94a3b8", margin: "4px 0 0 0",
          lineHeight: 1.4,
        }}>
          Centang kotak di atas. Google mungkin meminta tantangan gambar untuk memverifikasi.
        </p>
      )}

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
