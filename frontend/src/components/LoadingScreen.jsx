import { useState, useEffect } from "react";

export default function LoadingScreen({ isLoading, text = "Memuat..." }) {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Ultra-fast fade-out transition (150ms) without artificial delay
      const timer = setTimeout(() => setShow(false), 150);
      return () => clearTimeout(timer);
    }
    setShow(true);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-opacity duration-150 ease-out ${
        !isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center w-[80px] h-[80px]">
        <div className="absolute w-[110px] h-[110px] rounded-full border-[3px] border-[#e8f5f4] border-t-[#007570] animate-[spin_0.8s_linear_infinite]" />
        <span className="text-[4.5rem] font-black font-sans text-[#007570] leading-none animate-[loadingPulse_1.2s_ease-in-out_infinite]">
          i
        </span>
        <span className="absolute top-[2px] right-[2px] w-[14px] h-[14px] rounded-full bg-[#00d4a0] animate-[loadingBounce_1.2s_ease-in-out_infinite]" />
      </div>
      <p className="mt-[28px] font-sans text-[0.95rem] font-semibold text-[#64748b] tracking-[0.04em] animate-[loadingFade_1.5s_ease-in-out_infinite]">
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
    <div className="flex flex-col items-center justify-center py-[60px] px-[20px] gap-[16px]">
      <div className="relative flex items-center justify-center w-[56px] h-[56px]">
        <div className="absolute w-[76px] h-[76px] rounded-full border-[3px] border-[#e8f5f4] border-t-[#007570] animate-[spin_0.8s_linear_infinite]" />
        <span className="text-[3rem] font-black font-sans text-[#007570] leading-none animate-[loadingPulse_1.2s_ease-in-out_infinite]">
          i
        </span>
        <span className="absolute top-[2px] right-[2px] w-[10px] h-[10px] rounded-full bg-[#00d4a0] animate-[loadingBounce_1.2s_ease-in-out_infinite]" />
      </div>
      <p className="mt-[12px] font-sans text-[0.85rem] font-semibold text-[#64748b] tracking-[0.04em] animate-[loadingFade_1.5s_ease-in-out_infinite]">
        {text}
        <span className="loading-dots" />
      </p>
    </div>
  );
}
