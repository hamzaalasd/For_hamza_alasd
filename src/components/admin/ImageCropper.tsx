import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, RotateCw, RotateCcw } from 'lucide-react';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

interface ImageCropperProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function ImageCropper({ imageSrc, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1.414); // Default to A4 Landscape
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImageBase64);
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl h-full sm:h-[90vh] flex flex-col bg-system-card border-x sm:border border-system-border sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-system-border bg-system-card/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse" />
            <h3 className="font-bold font-mono text-system-text uppercase tracking-widest text-sm">
              IMAGE_EDITOR // CROP_ROTATE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-system-border rounded-xl transition-all text-system-muted hover:text-system-text active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-[#050505] touch-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteInternal}
            classes={{
              containerClassName: "cursor-move",
              cropAreaClassName: "border-2 border-system-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]"
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-system-border bg-system-card/80 backdrop-blur-xl space-y-6">
          
          {/* Aspect Ratio Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-system-muted uppercase tracking-tighter opacity-60">
              <div className="w-4 h-px bg-system-muted" />
              SELECT ASPECT RATIO
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'A4 عرضي', val: 1.414 },
                { label: 'A4 طولي', val: 1 / 1.414 },
                { label: '4:3 Landscape', val: 4 / 3 },
                { label: '3:4 Portrait', val: 3 / 4 },
                { label: 'Square 1:1', val: 1 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAspect(opt.val)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold font-mono transition-all border ${
                    Math.abs(aspect - opt.val) < 0.01
                      ? 'bg-system-accent text-black border-system-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]'
                      : 'bg-system-bg border-system-border text-system-muted hover:border-system-accent/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Zoom Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold font-mono text-system-muted uppercase">ZOOM_LEVEL</span>
                <span className="text-[10px] font-bold font-mono text-system-accent">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-system-border rounded-full appearance-none cursor-pointer accent-system-accent"
              />
            </div>

            {/* Rotation and Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-system-bg border border-system-border rounded-xl p-1">
                <button
                  onClick={() => setRotation((prev) => prev - 90)}
                  className="p-2.5 text-system-muted hover:text-system-accent transition-colors rounded-lg hover:bg-system-accent/10"
                  title="Rotate Left"
                >
                  <RotateCcw size={18} />
                </button>
                <div className="w-px h-4 bg-system-border mx-1" />
                <button
                  onClick={() => setRotation((prev) => prev + 90)}
                  className="p-2.5 text-system-muted hover:text-system-accent transition-colors rounded-lg hover:bg-system-accent/10"
                  title="Rotate Right"
                >
                  <RotateCw size={18} />
                </button>
              </div>

              <div className="flex-1 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-xs font-bold font-mono text-system-muted hover:text-system-text border border-system-border rounded-xl hover:bg-system-border/30 transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-system-accent text-black font-bold font-mono text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(var(--accent-rgb),0.25)]"
                >
                  <Check size={16} strokeWidth={3} />
                  APPLY_CHANGES
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
