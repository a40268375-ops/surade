import React, { useRef, useEffect, useCallback } from "react";

/**
 * InfiniteScroller
 * Carousel horizontal yang:
 * 1. Bergerak sendiri secara otomatis saat tidak diinteraksi.
 * 2. LANGSUNG DIEM DULU saat kursor diarahkan ke atasnya (onMouseEnter / onTouchStart)
 *    agar user bisa bersiap dan menggeser dengan tenang tanpa ngestuck atau melawan arah pergerakan.
 * 3. BISA DIGESER SENDIRI dengan mouse / touch tanpa batas (seamless infinite loop).
 * 4. Otomatis jalan sendiri lagi saat kursor keluar (onMouseLeave) atau setelah sentuhan dilepas.
 */
export default function InfiniteScroller({
  children,
  speed = 1.0, // pixel per frame
  direction = "left", // "left" | "right"
  className = "",
  trackClassName = "",
  gap = 16,
  autoPlay = true,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const animFrameRef = useRef(null);

  // Floating-point position accumulator
  const scrollPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const lastXRef = useRef(0);
  const hasMovedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  // Direction multiplier
  const effectiveSpeed = direction === "right" ? -Math.abs(speed) : Math.abs(speed);

  // Normalisasi scroll agar selalu dalam range aman Set 2
  const wrapScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const singleWidth = el.scrollWidth / 3;
    if (singleWidth <= 0) return;

    if (scrollPosRef.current >= singleWidth * 2) {
      scrollPosRef.current -= singleWidth;
      el.scrollLeft = scrollPosRef.current;
    } else if (scrollPosRef.current <= singleWidth * 0.1) {
      scrollPosRef.current += singleWidth;
      el.scrollLeft = scrollPosRef.current;
    }
  }, []);

  // Set initial scroll position to the middle set (Set 2)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const setupInitialPosition = () => {
      const singleWidth = el.scrollWidth / 3;
      if (singleWidth > 0 && (scrollPosRef.current === 0 || scrollPosRef.current < singleWidth * 0.2)) {
        scrollPosRef.current = singleWidth;
        el.scrollLeft = singleWidth;
      }
    };

    const timer = setTimeout(setupInitialPosition, 100);
    window.addEventListener("resize", setupInitialPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setupInitialPosition);
    };
  }, [children]);

  // Continuous Animation Loop via requestAnimationFrame
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !autoPlay) return;

    let lastTime = performance.now();

    const step = (time) => {
      const delta = Math.min((time - lastTime) / 16.67, 2.5); // Cap frame delta
      lastTime = time;

      // HANYA jalan jika TIDAK sedang di-drag dan TIDAK sedang di-hover (ketika kursor masuk, DIEM DULU!)
      const canRun = !isDraggingRef.current && !isHoveredRef.current;

      if (canRun && el) {
        scrollPosRef.current += effectiveSpeed * delta;
        wrapScroll();
        el.scrollLeft = scrollPosRef.current;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [autoPlay, effectiveSpeed, wrapScroll]);

  // Handle Drag Move (Incremental Delta)
  const handleDragMove = useCallback((clientX) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const deltaX = clientX - lastXRef.current;
    if (Math.abs(deltaX) > 2) {
      hasMovedRef.current = true;
    }
    lastXRef.current = clientX;

    // Geser menggunakan delta inkremental
    scrollPosRef.current -= deltaX;

    // Seamless wrap
    const singleWidth = el.scrollWidth / 3;
    if (singleWidth > 0) {
      if (scrollPosRef.current >= singleWidth * 2) {
        scrollPosRef.current -= singleWidth;
      } else if (scrollPosRef.current <= singleWidth * 0.1) {
        scrollPosRef.current += singleWidth;
      }
    }

    el.scrollLeft = scrollPosRef.current;
  }, []);

  // Handle Drag End
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Bersihkan listener window
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
    window.removeEventListener("touchmove", onWindowTouchMove);
    window.removeEventListener("touchend", onWindowTouchEnd);
    window.removeEventListener("touchcancel", onWindowTouchEnd);

    // Pastikan posisi sinkron
    const el = containerRef.current;
    if (el) {
      scrollPosRef.current = el.scrollLeft;
      wrapScroll();
    }

    // Reset flag drag setelah microtask agar click handler tahu apakah user men-drag
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);

    // Untuk sentuhan layar HP: beri jeda 1 detik setelah lepas jari sebelum lanjut jalan sendiri
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isHoveredRef.current = false;
    }, 1000);
  }, [wrapScroll]);

  const onWindowMouseMove = useCallback((e) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const onWindowMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const onWindowTouchMove = useCallback((e) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX);
    }
  }, [handleDragMove]);

  const onWindowTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Handle Drag Start
  const handleDragStart = (clientX) => {
    const el = containerRef.current;
    if (!el) return;

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    isHoveredRef.current = true; // Pastikan langsung diam
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    lastXRef.current = clientX;
    scrollPosRef.current = el.scrollLeft;

    // Pasang listener di window agar mouse drag tidak pernah lepas atau ngestuck saat keluar kontainer
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });
    window.addEventListener("mouseup", onWindowMouseUp, { passive: true });
    window.addEventListener("touchmove", onWindowTouchMove, { passive: true });
    window.addEventListener("touchend", onWindowTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onWindowTouchEnd, { passive: true });
  };

  // Prevent link click when user was actually dragging
  const handleCaptureClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "auto",
        touchAction: "pan-y",
      }}
      /* ── KETIKA KURSOR MASUK: LANGSUNG DIEM DULU ── */
      onMouseEnter={() => {
        isHoveredRef.current = true;
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      }}
      /* ── KETIKA KURSOR KELUAR: JALAN SENDIRI LAGI ── */
      onMouseLeave={() => {
        if (!isDraggingRef.current) {
          isHoveredRef.current = false;
        }
      }}
      onMouseDown={(e) => {
        // Hanya tangani left click (button 0)
        if (e.button === 0) {
          handleDragStart(e.clientX);
        }
      }}
      onTouchStart={(e) => {
        isHoveredRef.current = true; // Sentuh -> LANGSUNG DIEM DULU
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        if (e.touches.length > 0) {
          handleDragStart(e.touches[0].clientX);
        }
      }}
      onClickCapture={handleCaptureClick}
      onDragStart={(e) => e.preventDefault()} // Mencegah HTML5 native ghost image drag yang bikin macet!
    >
      <div
        ref={trackRef}
        className={`flex w-max will-change-transform ${trackClassName}`}
        style={{ width: "max-content", gap: `${gap}px` }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Set 1 */}
        <div className="flex shrink-0 items-center pointer-events-auto" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        {/* Set 2 (Tengah) */}
        <div className="flex shrink-0 items-center pointer-events-auto" style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
        {/* Set 3 */}
        <div className="flex shrink-0 items-center pointer-events-auto" style={{ gap: `${gap}px` }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
