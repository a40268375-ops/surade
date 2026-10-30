import React, { useState } from "react";
import coinImg from "../assets/surade-coin.png";
import "./SuradeCoin3D.css";

export default function SuradeCoinIcon({ size = 28, className = "", animate = false, spin3d = false, type = "gold" }) {
  const pixelSize = typeof size === "number" ? size : 28;
  const [isSpinning, setIsSpinning] = useState(false);

  const isSilver = type === "silver";

  const handleTap = () => {
    if (spin3d && !isSpinning) {
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 1400);
    }
  };

  const silverFilter = isSilver
    ? "grayscale(100%) brightness(1.22) contrast(1.15) drop-shadow(0 2px 4px rgba(148,163,184,0.5))"
    : undefined;

  // If 3D realistic mode is enabled
  if (spin3d) {
    return (
      <div
        className={`surade-coin-3d-scene ${className}`}
        style={{
          width: pixelSize,
          height: pixelSize,
          minWidth: pixelSize,
          minHeight: pixelSize,
          filter: isSilver ? silverFilter : undefined,
        }}
        onClick={handleTap}
        title={isSilver ? "Poin Silver Surade" : "Poin Gold Surade (Klik untuk putar 3D)"}
      >
        {/* Soft 3D ground shadow */}
        <div className="surade-coin-3d-shadow" />

        {/* 3D Physical Coin Disc with Thickness Layers */}
        <div className={`surade-coin-3d-disc ${isSpinning ? "is-spinning" : ""}`}>
          {/* Extruded physical 3D gold rim layers (so coin never flattens into a line) */}
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(4px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(3px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(2px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(1px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(0px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(-1px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(-2px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(-3px)" }} />
          <div className="surade-coin-3d-rim" style={{ transform: "translateZ(-4px)" }} />

          {/* Front Face with Specular Glare */}
          <div className="surade-coin-3d-face surade-coin-3d-front">
            <img
              src={coinImg}
              alt={isSilver ? "Surade Silver Coin" : "Surade Gold Coin"}
              width={pixelSize}
              height={pixelSize}
              className="w-full h-full object-contain rounded-full select-none pointer-events-none"
              loading="eager"
            />
            <div className="surade-coin-3d-glare" />
          </div>

          {/* Back Face with Specular Glare */}
          <div className="surade-coin-3d-face surade-coin-3d-back">
            <img
              src={coinImg}
              alt={isSilver ? "Surade Silver Coin" : "Surade Gold Coin"}
              width={pixelSize}
              height={pixelSize}
              className="w-full h-full object-contain rounded-full select-none pointer-events-none"
              loading="eager"
            />
            <div className="surade-coin-3d-glare" />
          </div>
        </div>
      </div>
    );
  }

  // Standard lightweight 2D icon
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${animate ? "animate-pulse" : ""} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        minWidth: pixelSize,
        minHeight: pixelSize,
      }}
    >
      <img
        src={coinImg}
        alt={isSilver ? "Poin Silver" : "Poin Gold"}
        width={pixelSize}
        height={pixelSize}
        style={{
          filter: isSilver ? silverFilter : undefined,
        }}
        className="w-full h-full object-contain rounded-full select-none pointer-events-none drop-shadow-sm"
        loading="eager"
      />
    </div>
  );
}
