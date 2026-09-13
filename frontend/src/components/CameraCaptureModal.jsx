import { useEffect, useRef, useState } from "react";
import { X, Camera as CameraIcon, RotateCcw } from "lucide-react";
import "./CameraCaptureModal.css";

/**
 * Modal kamera langsung di halaman (pakai getUserMedia bawaan browser),
 * BUKAN membuka aplikasi kamera terpisah dari OS.
 *
 * Kenapa begini dan bukan pakai <input capture="user">?
 * Atribut `capture` pada <input type="file"> itu perilakunya tidak
 * konsisten di desktop (kadang cuma buka app Kamera bawaan Windows/Mac
 * secara terpisah, dan hasil fotonya tidak selalu otomatis "kembali" ke
 * form kita). Dengan getUserMedia, live preview kameranya tampil LANGSUNG
 * di dalam modal ini, jadi hasil jepretannya pasti langsung nyambung ke
 * alur crop foto profil kita tanpa keluar dari halaman sama sekali.
 *
 * Props:
 * - onCapture(dataUrl): dipanggil setelah user menekan tombol jepret
 * - onCancel(): dipanggil saat modal ditutup tanpa mengambil foto
 */
export default function CameraCaptureModal({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // "user" = kamera depan, "environment" = kamera belakang

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      setError("");
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        if (err.name === "NotAllowedError") {
          setError("Akses kamera ditolak. Izinkan akses kamera di browser kamu lalu coba lagi.");
        } else if (err.name === "NotFoundError") {
          setError("Tidak ada kamera yang terdeteksi di perangkat ini.");
        } else {
          setError("Gagal membuka kamera: " + err.message);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function handleClose() {
    stopCamera();
    onCancel?.();
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Kalau kamera depan, gambar di-mirror (kayak cermin) biar hasilnya
    // sesuai apa yang dilihat user di preview, bukan kebalik.
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    stopCamera();
    onCapture?.(dataUrl);
  }

  return (
    <div className="camera-modal-backdrop" onClick={handleClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal__header">
          <h3>Ambil Foto Profil</h3>
          <button type="button" className="camera-modal__close" onClick={handleClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="camera-modal__stage">
          {error ? (
            <div className="camera-modal__error">{error}</div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`camera-modal__video ${facingMode === "user" ? "is-mirrored" : ""}`}
            />
          )}
        </div>

        <div className="camera-modal__actions">
          <button
            type="button"
            className="camera-modal__btn camera-modal__btn--ghost"
            onClick={() => setFacingMode((m) => (m === "user" ? "environment" : "user"))}
            title="Ganti kamera depan/belakang"
          >
            <RotateCcw size={15} />
            Ganti Kamera
          </button>
          <button
            type="button"
            className="camera-modal__btn camera-modal__btn--primary camera-modal__btn--icon-only"
            onClick={handleCapture}
            disabled={!!error}
            title="Jepret"
            aria-label="Jepret"
          >
            <CameraIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}