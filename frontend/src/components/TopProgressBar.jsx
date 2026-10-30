import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { loadingManager, useGlobalLoading } from "../utils/loadingManager";

/**
 * TopProgressBar: Indikator loading bar tipis elegan di bagian paling atas layar.
 * - Tetap aktif berputar selama website masih memuat data (API atau navigasi)
 * - Menampilkan garis progres gradasi halus di bagian paling atas viewport
 */
export default function TopProgressBar() {
  const location = useLocation();
  const globalLoading = useGlobalLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const creepIntervalRef = useRef(null);

  // 1. Trigger saat rute berpindah (navigasi halaman)
  useEffect(() => {
    loadingManager.start("route-transition");
    setProgress(28);

    const step1 = setTimeout(() => {
      setProgress((prev) => Math.max(prev, 60));
    }, 150);

    const finishNav = setTimeout(() => {
      loadingManager.stop("route-transition");
    }, 450);

    return () => {
      clearTimeout(step1);
      clearTimeout(finishNav);
      loadingManager.stop("route-transition");
    };
  }, [location.pathname, location.search]);

  // 2. Sinkronisasi dengan Global Loading State (API request & Route)
  useEffect(() => {
    let safetyTimer = null;

    if (globalLoading) {
      setVisible(true);
      setProgress((prev) => (prev < 35 ? 35 : Math.min(85, prev + 10)));

      // Perlahan merayap maju jika loading masih berjalan
      if (creepIntervalRef.current) clearInterval(creepIntervalRef.current);
      creepIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 65) return prev + 6;
          if (prev < 88) return prev + 2;
          if (prev < 95) return prev + 0.5;
          return prev;
        });
      }, 300);

      // Safety Auto-Dismiss: Maksimal 1.8 detik
      // Mencegah indikator 'Memuat...' menggantung saat halaman sudah siap
      safetyTimer = setTimeout(() => {
        if (creepIntervalRef.current) {
          clearInterval(creepIntervalRef.current);
          creepIntervalRef.current = null;
        }
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
      }, 1800);
    } else {
      if (creepIntervalRef.current) {
        clearInterval(creepIntervalRef.current);
        creepIntervalRef.current = null;
      }

      // Selesai memuat: tancap ke 100% lalu sembunyikan dengan mulus
      setProgress(100);
      const finishTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);

      return () => {
        clearTimeout(finishTimer);
        if (safetyTimer) clearTimeout(safetyTimer);
      };
    }

    return () => {
      if (creepIntervalRef.current) {
        clearInterval(creepIntervalRef.current);
        creepIntervalRef.current = null;
      }
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [globalLoading]);

  // 3. Listener cadangan untuk event kustom loading
  useEffect(() => {
    const handleStart = () => loadingManager.start("custom-event");
    const handleStop = () => loadingManager.stop("custom-event");

    window.addEventListener("app:loading-start", handleStart);
    window.addEventListener("app:loading-stop", handleStop);

    return () => {
      window.removeEventListener("app:loading-start", handleStart);
      window.removeEventListener("app:loading-stop", handleStop);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3.5px] bg-transparent">
      <div
        className="h-full transition-all ease-out shadow-[0_1px_8px_rgba(5,150,105,0.6)]"
        style={{
          width: `${Math.min(100, Math.round(progress))}%`,
          background: "linear-gradient(90deg, #059669 0%, #10b981 60%, #38bdf8 100%)",
          opacity: progress >= 100 ? 0 : 1,
          transition:
            progress >= 100
              ? "width 180ms ease-out, opacity 250ms ease-out 120ms"
              : "width 240ms ease-out",
        }}
      />
    </div>
  );
}
