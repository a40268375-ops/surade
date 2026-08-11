import { useEffect, useRef, useState } from "react";
import { ZoomIn, X, Check } from "lucide-react";
import "./AvatarCropperModal.css";

const CANVAS_SIZE = 320; // resolusi output foto profil (px), cukup tajam buat avatar bulat

/**
 * Modal buat atur ukuran (zoom) & posisi foto profil sebelum disimpan,
 * karena user minta bisa "edit ukurannya" saat pilih foto profil baru.
 *
 * Cara pakai:
 *   <AvatarCropperModal
 *     imageSrc={objectUrlDariFileYangDipilih}
 *     onCancel={() => ...}
 *     onSave={(dataUrl, blob) => ...}
 *   />
 *
 * Prinsip kerja: gambar digambar ke <canvas> pakai posisi & skala saat
 * ini setiap kali di-zoom/digeser, jadi apa yang tampil di canvas itu
 * PERSIS yang bakal disimpan (nggak ada perhitungan crop terpisah yang
 * bisa meleset).
 */
export default function AvatarCropperModal({ imageSrc, onCancel, onSave }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragStateRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgReady, setImgReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Muat gambar sekali di awal
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Gambar ulang canvas tiap kali zoom/posisi berubah
  useEffect(() => {
    if (!imgReady) return;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgReady, zoom, offset]);

  function draw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    const cv = CANVAS_SIZE;

    const baseScale = Math.max(cv / img.naturalWidth, cv / img.naturalHeight);
    const scale = baseScale * zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const drawX = cv / 2 - drawW / 2 + offset.x;
    const drawY = cv / 2 - drawH / 2 + offset.y;

    ctx.clearRect(0, 0, cv, cv);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, cv, cv);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function handlePointerDown(e) {
    const point = "touches" in e ? e.touches[0] : e;
    dragStateRef.current = { startX: point.clientX, startY: point.clientY, startOffset: offset };
    setDragging(true);
  }

  function handlePointerMove(e) {
    if (!dragStateRef.current) return;
    const point = "touches" in e ? e.touches[0] : e;
    const dx = point.clientX - dragStateRef.current.startX;
    const dy = point.clientY - dragStateRef.current.startY;
    setOffset({ x: dragStateRef.current.startOffset.x + dx, y: dragStateRef.current.startOffset.y + dy });
  }

  function handlePointerUp() {
    dragStateRef.current = null;
    setDragging(false);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const dataUrl = canvas.toDataURL("image/png");
      const file = new File([blob], "avatar.png", { type: "image/png" });
      onSave?.(dataUrl, file);
    }, "image/png");
  }

  return (
    <div className="avatar-cropper-backdrop" onClick={onCancel}>
      <div className="avatar-cropper" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-cropper__header">
          <h3>Atur Foto Profil</h3>
          <button type="button" className="avatar-cropper__close" onClick={onCancel} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <p className="avatar-cropper__hint">Geser gambar untuk atur posisi, pakai slider untuk atur ukuran/zoom.</p>

        <div
          className="avatar-cropper__stage"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className={`avatar-cropper__canvas ${dragging ? "is-dragging" : ""}`}
          />
          <div className="avatar-cropper__circle-mask" />
        </div>

        <div className="avatar-cropper__zoom">
          <ZoomIn size={16} />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>

        <div className="avatar-cropper__actions">
          <button type="button" className="avatar-cropper__btn avatar-cropper__btn--ghost" onClick={onCancel}>
            Batal
          </button>
          <button type="button" className="avatar-cropper__btn avatar-cropper__btn--primary" onClick={handleSave}>
            <Check size={15} />
            Gunakan Foto Ini
          </button>
        </div>
      </div>
    </div>
  );
}