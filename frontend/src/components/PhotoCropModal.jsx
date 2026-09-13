import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, Check, RotateCcw } from "lucide-react";

/**
 * Modal untuk menggeser (pan) & memperbesar (zoom) foto sebelum dijadikan
 * foto profil - supaya user bisa atur sendiri bagian mana dari foto yang
 * mau ditampilkan di lingkaran avatar, alih-alih auto-crop tengah begitu
 * saja seperti sebelumnya.
 *
 * Cara pakai:
 *   <PhotoCropModal
 *     file={selectedFile}           // File/Blob hasil pilih dari <input type="file"> atau kamera
 *     onCancel={() => ...}
 *     onSave={(croppedFile) => ...} // dipanggil dengan File hasil crop (image/jpeg)
 *   />
 */

const VIEWPORT_SIZE = 280; // ukuran lingkaran preview di layar (px)
const OUTPUT_SIZE = 640;   // resolusi akhir foto yang diupload (px, persegi)
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function PhotoCropModal({ file, onCancel, onSave }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dragStateRef = useRef(null);
  const imgRef = useRef(null);

  // Baca file jadi data URL supaya bisa ditampilkan & digambar ke canvas
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target.result);
    reader.readAsDataURL(file);
  }, [file]);

  // baseScale = skala minimum supaya gambar selalu menutupi penuh
  // lingkaran viewport di zoom 1x (mirip object-fit: cover)
  const baseScale =
    naturalSize.w > 0 && naturalSize.h > 0
      ? Math.max(VIEWPORT_SIZE / naturalSize.w, VIEWPORT_SIZE / naturalSize.h)
      : 1;

  const displayW = naturalSize.w * baseScale * zoom;
  const displayH = naturalSize.h * baseScale * zoom;

  // Batasi pergeseran supaya gambar tidak bisa digeser sampai ada area
  // kosong (putih) kelihatan di dalam lingkaran.
  const clampOffset = useCallback(
    (next, currentZoom = zoom) => {
      const w = naturalSize.w * baseScale * currentZoom;
      const h = naturalSize.h * baseScale * currentZoom;
      const maxX = Math.max(0, (w - VIEWPORT_SIZE) / 2);
      const maxY = Math.max(0, (h - VIEWPORT_SIZE) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [naturalSize, baseScale, zoom]
  );

  const handleImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ w: naturalWidth, h: naturalHeight });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleZoomChange = (val) => {
    const nextZoom = parseFloat(val);
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(prev, nextZoom));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Drag untuk geser posisi (mouse & touch) ──
  const startDrag = (clientX, clientY) => {
    dragStateRef.current = { startX: clientX, startY: clientY, startOffset: offset };
    setIsDragging(true);
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragStateRef.current) return;
    const { startX, startY, startOffset } = dragStateRef.current;
    const next = {
      x: startOffset.x + (clientX - startX),
      y: startOffset.y + (clientY - startY),
    };
    setOffset(clampOffset(next));
  };

  const endDrag = () => {
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };
  const onMouseMove = (e) => {
    if (isDragging) moveDrag(e.clientX, e.clientY);
  };
  const onTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => endDrag();
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging]);

  // ── Render hasil crop ke canvas & jadikan File JPEG ──
  const handleSave = () => {
    if (!imgRef.current || naturalSize.w === 0) return;
    setIsSaving(true);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    // scaleRatio = perbandingan resolusi output vs ukuran viewport di layar,
    // dipakai supaya posisi/zoom yang ditata di layar ikut proporsional
    // saat digambar ke resolusi asli yang lebih besar.
    const scaleRatio = OUTPUT_SIZE / VIEWPORT_SIZE;
    const drawW = displayW * scaleRatio;
    const drawH = displayH * scaleRatio;
    const drawX = OUTPUT_SIZE / 2 + offset.x * scaleRatio - drawW / 2;
    const drawY = OUTPUT_SIZE / 2 + offset.y * scaleRatio - drawH / 2;

    // Crop lingkaran (avatar bulat) - area di luar lingkaran dibuang
    ctx.save();
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        setIsSaving(false);
        if (!blob) return;
        const croppedFile = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
        onSave(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[1100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Atur Posisi Foto</h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500 -mt-1">
          Geser fotonya untuk mengatur posisi, dan gunakan slider untuk memperbesar bagian yang diinginkan.
        </p>

        {/* Viewport lingkaran - area drag */}
        <div
          className="relative mx-auto rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-100 select-none"
          style={{
            width: VIEWPORT_SIZE,
            height: VIEWPORT_SIZE,
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Pratinjau foto"
              onLoad={handleImgLoad}
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
              style={{
                width: displayW || "auto",
                height: displayH || "auto",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          {/* Garis bantu lingkaran tipis di tepi, biar jelas batas cropnya */}
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 pointer-events-none" />
        </div>

        {/* Slider zoom */}
        <div className="flex items-center gap-3 px-1">
          <ZoomIn size={16} className="text-slate-400 shrink-0" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(e.target.value)}
            className="w-full accent-[#059669] cursor-pointer"
          />
          <button
            type="button"
            onClick={handleReset}
            title="Reset posisi & zoom"
            className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imgSrc || isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Check size={14} />
            {isSaving ? "Menyimpan..." : "Simpan Foto"}
          </button>
        </div>
      </div>
    </div>
  );
}