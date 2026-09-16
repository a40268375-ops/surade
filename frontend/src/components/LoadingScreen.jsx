import { useState, useEffect } from "react";
import logoImg from "../assets/logo-surade.png";

/**
 * Full-screen loading Surade.co.id.
 * Mengikuti progress loading secara dinamis (persentase & bar bergerak nyata
 * mengikuti proses muat aplikasi dan data).
 */
export default function LoadingScreen({
  isLoading,
  progress: externalProgress,
  text = "Surade.co.id",
  subtext = "Direktori UMKM Surade",
}) {
  const [show, setShow] = useState(isLoading);
  const [percent, setPercent] = useState(externalProgress !== undefined ? externalProgress : (isLoading ? 18 : 100));

  // Jika diberikan nilai progress eksplisit, ikuti nilainya langsung
  useEffect(() => {
    if (externalProgress !== undefined) {
      setPercent(Math.min(100, Math.max(0, externalProgress)));
    }
  }, [externalProgress]);

  // Pantau status isLoading dan gerakkan progress secara alami mengikuti waktu muat
  useEffect(() => {
    let interval = null;

    if (isLoading) {
      setShow(true);
      if (externalProgress === undefined) {
        // Mulai dari angka awal realistis
        setPercent((prev) => (prev >= 95 ? 18 : Math.max(18, prev)));

        interval = setInterval(() => {
          setPercent((prev) => {
            if (prev < 45) return prev + Math.floor(Math.random() * 8 + 6);
            if (prev < 75) return prev + Math.floor(Math.random() * 6 + 3);
            if (prev < 92) return prev + Math.floor(Math.random() * 3 + 1);
            return prev;
          });
        }, 110);
      }
    } else {
      // Selesai memuat! Langsung tuntaskan progress bar ke 100%
      setPercent(100);
      const timer = setTimeout(() => {
        setShow(false);
      }, 350);
      return () => clearTimeout(timer);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, externalProgress]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-300 ease-out ${
        !isLoading && percent >= 100 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 50% 42%, rgba(44,180,94,.16), transparent 28%), linear-gradient(135deg, #f7fff9 0%, #eefaf2 48%, #ffffff 100%)",
      }}
      aria-label={`Memuat ${text}`}
    >
      <div className="relative flex flex-col items-center justify-center text-center w-[min(92vw,430px)] min-h-[480px]">
        {/* Partikel mengambang */}
        <span className="loading-particle" style={{ left: "8%", top: "30%", background: "#21aee6" }} />
        <span className="loading-particle" style={{ right: "5%", top: "18%", background: "#7ac943", animationDelay: "1s" }} />
        <span className="loading-particle" style={{ right: "12%", bottom: "22%", background: "#f2b632", animationDelay: "2s" }} />
        <span className="loading-particle" style={{ left: "12%", bottom: "18%", background: "#1a9d51", animationDelay: ".7s" }} />

        {/* Logo + ring + orbit */}
        <div className="relative w-[180px] h-[180px] grid place-items-center animate-[loadingFloat_2.8s_ease-in-out_infinite]">
          <div className="absolute inset-[-8px] rounded-full border border-dashed border-[rgba(119,201,69,.45)] animate-[loadingSpinReverse_5s_linear_infinite]">
            <span className="loading-orbit-dot" style={{ top: "12%", left: "20%", background: "#f2b632" }} />
            <span className="loading-orbit-dot" style={{ right: "8%", bottom: "25%", background: "#f2b632" }} />
            <span className="loading-orbit-dot" style={{ left: "18%", bottom: "9%", background: "#20aee5" }} />
          </div>

          <div className="absolute inset-[8px] rounded-full border-2 animate-[spin_2.2s_linear_infinite] loading-ring" />

          <img
            src={logoImg}
            alt="Logo Surade.co.id"
            className="relative z-[3] w-[140px] h-[140px] object-contain animate-[loadingLogoPulse_2s_ease-in-out_infinite]"
            style={{ filter: "drop-shadow(0 12px 20px rgba(22,120,68,.18))" }}
          />
        </div>

        <div className="mt-4 text-[26px] font-extrabold tracking-[.04em] text-[#126c3e] animate-[loadingFadeUp_.8s_ease_both]">
          {text}
        </div>

        <div className="mt-1 text-xs sm:text-sm text-[#6a7f73] animate-[loadingFadeUp_1s_ease_.15s_both]">
          {subtext}
        </div>

        <div className="mt-3.5 inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/80 border border-[rgba(26,157,81,.16)] shadow-[0_6px_20px_rgba(28,100,57,.08)] text-xs font-bold text-[#20864d]">
          <span className={`w-2 h-2 rounded-full ${percent >= 100 ? "bg-[#059669]" : "bg-[#38b66a] animate-ping"}`} />
          <span>{percent < 100 ? "Menyiapkan pengalaman terbaik untuk UMKM" : "Halaman siap dibuka!"}</span>
        </div>

        {/* Progress Bar Dinamis yang Benar-Benar Mengikuti Loading */}
        <div className="w-[min(320px,78vw)] h-[8px] mt-6 rounded-full overflow-hidden bg-[#dcefe2] shadow-[inset_0_1px_3px_rgba(0,0,0,.06)]">
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${Math.min(100, percent)}%`,
              background: "linear-gradient(90deg, #059669, #10b981, #0284c7)",
            }}
          />
        </div>

        {/* Indikator Persentase & Status Dinamis */}
        <div className="mt-2.5 flex items-center justify-between w-[min(320px,78vw)] text-[11.5px] font-bold text-[#20864d]">
          <span className="flex items-center gap-1">
            {percent < 100 ? (
              <>
                <span>Memuat data</span>
                <span className="loading-dots" />
              </>
            ) : (
              "Selesai 100%"
            )}
          </span>
          <span className="font-mono text-xs font-black">{Math.round(percent)}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner untuk komponen saat fetch data lokal
 */
export function InlineSpinner({ text = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-[20px] gap-[16px]">
      <svg
        className="w-10 h-10 text-[#00b074] animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636"
        />
      </svg>
      <span className="text-[14px] text-[#64748b] font-medium">{text}</span>
    </div>
  );
}