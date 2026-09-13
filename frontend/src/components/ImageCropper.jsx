import { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

/**
 * ImageCropper Component
 * Allows users to crop, zoom, and reposition images before upload
 */
export default function ImageCropper({ imageUrl, onCropComplete, onCancel, aspectRatio = 1 }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Load image
  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400 / aspectRatio;

    // Center image initially
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgAspect;
    }

    const initialX = (canvas.width - drawWidth) / 2;
    const initialY = (canvas.height - drawHeight) / 2;
    setPosition({ x: initialX, y: initialY });
  }, [aspectRatio]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Calculate dimensions
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      drawHeight = canvas.height * zoom;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = canvas.width * zoom;
      drawHeight = drawWidth / imgAspect;
    }

    // Apply rotation if any
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw image
    ctx.drawImage(image, position.x, position.y, drawWidth, drawHeight);

    // Restore context state
    ctx.restore();

    // Draw grid overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.moveTo((canvas.width * 2) / 3, 0);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height);
    ctx.moveTo(0, canvas.height / 3);
    ctx.lineTo(canvas.width, canvas.height / 3);
    ctx.moveTo(0, (canvas.height * 2) / 3);
    ctx.lineTo(canvas.width, (canvas.height * 2) / 3);
    ctx.stroke();
  }, [zoom, position, rotation]);

  // Handle mouse events for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  // Rotation
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Reset
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    handleImageLoad();
  };

  // Redraw when zoom, position, or rotation changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Crop and return result
  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        onCropComplete(file, canvas.toDataURL("image/jpeg", 0.9));
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Crop & Atur Foto</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Container */}
        <div className="p-6 bg-slate-100">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ touchAction: "none" }}>
            <canvas
              ref={canvasRef}
              className="w-full h-auto cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
              <Move size={12} />
              <span>Geser untuk reposisi</span>
            </div>
          </div>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
            onLoad={handleImageLoad}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 space-y-4 border-t border-slate-200">
          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Zoom</label>
              <span className="text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              <RotateCcw size={16} />
              <span>Putar 90°</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-6 py-5 border-t-2 border-slate-200 bg-white">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-base hover:bg-slate-100 transition-colors shadow-sm"
          >
            Batal
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-base transition-all shadow-lg"
          >
            <Check size={18} strokeWidth={3} />
            <span>Simpan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
