import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * TopProgressBar: Indikator loading bar di bagian paling atas layar
 * yang aktif dan bergerak secara nyata mengikuti perpindahan halaman (routing)
 * serta pemanggilan data API.
 */
export default function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Trigger saat rute berpindah
  useEffect(() => {
    setVisible(true);
    setProgress(25);

    const step1 = setTimeout(() => setProgress(65), 100);
    const step2 = setTimeout(() => setProgress(90), 220);
    const step3 = setTimeout(() => setProgress(100), 380);
    const finish = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(finish);
    };
  }, [location.pathname, location.search]);

  // Listener untuk event global API loading jika dipanggil
  useEffect(() => {
    let apiTimer = null;

    const handleStart = () => {
      setVisible(true);
      setProgress((prev) => (prev < 30 ? 30 : Math.min(85, prev + 15)));
    };

    const handleStop = () => {
      setProgress(100);
      apiTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    };

    window.addEventListener("app:loading-start", handleStart);
    window.addEventListener("app:loading-stop", handleStop);

    return () => {
      window.removeEventListener("app:loading-start", handleStart);
      window.removeEventListener("app:loading-stop", handleStop);
      if (apiTimer) clearTimeout(apiTimer);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3.5px] bg-transparent">
      <div
        className="h-full transition-all duration-200 ease-out shadow-[0_1px_8px_rgba(5,150,105,0.6)]"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #059669 0%, #10b981 60%, #38bdf8 100%)",
          opacity: progress >= 100 ? 0 : 1,
          transition: progress >= 100 ? "width 180ms ease-out, opacity 250ms ease-out 100ms" : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
