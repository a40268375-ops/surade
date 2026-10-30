import React, { useState } from "react";
import ArcDotsLoader from "./ArcDotsLoader";
import useTabFaviconLoader from "../hooks/useTabFaviconLoader";
import { Sparkles, Globe, Play, CheckCircle2, Sliders, RefreshCw, Layers } from "lucide-react";

/**
 * ArcLoaderShowcase
 * Komponen pameran interaktif untuk mencoba animasi Chasing Arc Dots
 * lengkap dengan switch preset warna, ukuran, mode rotasi, dan simulasi tab browser.
 */
export default function ArcLoaderShowcase() {
  const [activePreset, setActivePreset] = useState("emerald");
  const [activeMode, setActiveMode] = useState("chase");
  const [activeSize, setActiveSize] = useState("lg");
  const [showGlow, setShowGlow] = useState(true);
  const [showCenter, setShowCenter] = useState(false);
  const [dotCount, setDotCount] = useState(5);
  const [isTabSimActive, setIsTabSimActive] = useState(false);

  // Hook untuk memutar animasi di tab browser asli saat dicoba
  useTabFaviconLoader(isTabSimActive, {
    preset: activePreset,
    originalFavicon: "/logo-surade.png",
  });

  const presets = [
    { id: "chrome", name: "Chrome Classic", desc: "Monokrom gelap persis tab browser di gambar", color: "#0f172a" },
    { id: "emerald", name: "Surade Emerald", desc: "Hijau zamrud resmi Surade.com dengan pendaran", color: "#059669" },
    { id: "gold", name: "Warm Gold", desc: "Aksen emas mewah untuk transaksi & tier premium", color: "#d97706" },
    { id: "ocean", name: "Sky Ocean", desc: "Biru cerah cyan modern", color: "#0284c7" },
  ];

  const sizes = [
    { id: "xs", label: "XS (18px - Tab Favicon)" },
    { id: "sm", label: "SM (24px - Tombol/Inline)" },
    { id: "md", label: "MD (36px - Kartu/Widget)" },
    { id: "lg", label: "LG (54px - Modal/Dialog)" },
    { id: "xl", label: "XL (80px - Layar Penuh)" },
  ];

  const modes = [
    { id: "chase", label: "Elastic Chase (Persis Tab Chrome)", desc: "Butiran mengejar & berkumpul di lengkungan atas" },
    { id: "stream", label: "Continuous Stream", desc: "Lengkungan utuh berputar halus 60fps" },
    { id: "wave", label: "Pulse Wave", desc: "Lengkungan berdenyut lembut" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden max-w-4xl mx-auto my-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
              <Sparkles size={13} />
              <span>Sesuai Gambar Referensi Tab Chrome</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Animasi Loading Lengkungan Titik (Chasing Arc Dots)
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Direkayasa presisi dari animasi loading tab browser Chrome dengan perbaikan estetika: pendaran glow, gradasi dinamis, dan integrasi favicon langsung ke tab browser Anda.
            </p>
          </div>

          {/* Tab Browser Test Trigger */}
          <button
            type="button"
            onClick={() => setIsTabSimActive(!isTabSimActive)}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all shadow-md ${
              isTabSimActive
                ? "bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300 animate-pulse"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            <Globe size={15} />
            <span>{isTabSimActive ? "Hentikan Animasi Tab" : "Coba Putar di Tab Browser Anda!"}</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Left: Controls */}
        <div className="lg:col-span-5 p-6 space-y-6 bg-slate-50/50">
          {/* Preset Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
              Pilihan Skema Warna (Preset)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePreset(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePreset === p.id
                      ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
              Gaya Animasi (Physics Mode)
            </label>
            <div className="space-y-1.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMode(m.id)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    activeMode === m.id
                      ? "border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>{m.label}</span>
                  {activeMode === m.id && <CheckCircle2 size={14} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
              Ukuran Spinner
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSize(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    activeSize === s.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
              <span>Pendaran Cahaya (Ambient Glow)</span>
              <input
                type="checkbox"
                checked={showGlow}
                onChange={(e) => setShowGlow(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
              <span>Logo Mini di Tengah (Center Disc)</span>
              <input
                type="checkbox"
                checked={showCenter}
                onChange={(e) => setShowCenter(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Right: Live Preview Stage */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
          {/* Simulated Browser Tab preview */}
          <div className="w-full bg-slate-100 rounded-2xl p-3 border border-slate-200 shadow-inner mb-6">
            <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center justify-between">
              <span>Pratinjau Tab Browser (Mirip Foto Anda)</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Pixel-Perfect Match
              </span>
            </div>
            {/* Chrome style tab mockup */}
            <div className="bg-white rounded-t-xl px-4 py-2 border border-b-0 border-slate-300/80 shadow-sm flex items-center gap-2.5 max-w-xs">
              <ArcDotsLoader
                size={18}
                mode={activeMode}
                preset={activePreset}
                showGlow={false}
              />
              <span className="text-xs font-medium text-slate-800 truncate">
                Laporan PKL Triwala SMK Amaliah
              </span>
              <span className="text-slate-400 text-xs ml-auto">×</span>
            </div>
          </div>

          {/* Main Hero Showcase */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center">
              <ArcDotsLoader
                size={activeSize}
                mode={activeMode}
                preset={activePreset}
                showGlow={showGlow}
                showCenter={showCenter}
                dotCount={dotCount}
                text="Memuat data..."
                subtext="Menyiapkan informasi terbaik untuk Anda"
              />
            </div>
          </div>

          {/* Size comparison row */}
          <div className="border-t border-slate-200/70 pt-4 flex items-center justify-around gap-2 text-center">
            {["xs", "sm", "md", "lg"].map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-1.5">
                <div className="h-14 flex items-center justify-center">
                  <ArcDotsLoader
                    size={sz}
                    mode={activeMode}
                    preset={activePreset}
                    showGlow={showGlow}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {sz}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
