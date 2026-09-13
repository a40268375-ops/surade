import "./WaveDivider.css";

/**
 * Pemisah bergelombang antar section (kayak di rafting-experience.com).
 *
 * Props:
 * - position: "top" | "bottom"   → gelombang di atas atau bawah section
 * - color:    warna fill gelombang (harus SAMA dengan background section
 *             yang mau "ditutupi" gelombangnya — bukan section ini)
 * - flip:     boolean, balik arah lengkungan (variasi biar nggak monoton)
 */
export default function WaveDivider({ position = "bottom", color = "#ffffff", flip = false }) {
  return (
    <div
      className={`wave-divider wave-divider--${position}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,32 C240,96 480,0 720,24 C960,48 1200,112 1440,48 L1440,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}