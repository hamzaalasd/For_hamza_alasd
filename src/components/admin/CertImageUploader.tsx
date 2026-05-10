import { useState, useRef, useCallback } from 'react';
import type { DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, X, Loader2, CheckCircle2, AlertCircle,
  ImagePlus, Trash2, ZoomIn, Award, ShieldCheck
} from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface CertImageUploaderProps {
  certId: string;
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export default function CertImageUploader({ certId, imageUrl, onChange }: CertImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentImage = preview || imageUrl;

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('الملف يجب أن يكون صورة (PNG، JPG، WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الصورة يجب أن لا يتجاوز 10MB');
      return;
    }

    setError(null);
    setStatus('uploading');
    setProgress(0);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const path = `certifications/${certId}/${filename}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        setStatus('error');
        setError(err.message);
        URL.revokeObjectURL(localPreview);
        setPreview(null);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setStatus('done');
        setProgress(100);
        onChange(url);
        // Keep preview alive - it'll be replaced by imageUrl on next render
        setTimeout(() => {
          URL.revokeObjectURL(localPreview);
          setPreview(null);
        }, 500);
      }
    );
  }, [certId, onChange]);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) uploadFile(files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = async () => {
    if (!imageUrl) { onChange(undefined); return; }
    try {
      const urlObj = new URL(imageUrl);
      const pathEncoded = urlObj.pathname.split('/o/')[1]?.split('?')[0];
      if (pathEncoded) {
        const path = decodeURIComponent(pathEncoded);
        const sRef = storageRef(storage, path);
        await deleteObject(sRef);
      }
    } catch { /* ignore */ }
    setPreview(null);
    setStatus('idle');
    setProgress(0);
    onChange(undefined);
  };

  return (
    <div className="space-y-3">
      {/* Section Label */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-system-accent uppercase tracking-wider">
          <ImagePlus size={13} />
          <span>صورة الشهادة (اختياري)</span>
        </div>
        <div className="h-px flex-1 bg-system-border" />
      </div>

      {/* Main Area */}
      <AnimatePresence mode="wait">
        {currentImage ? (
          /* ── Preview State ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative group rounded-xl overflow-hidden border border-system-border bg-system-card"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Certificate Image */}
            <img
              src={currentImage}
              alt="صورة الشهادة"
              className="w-full h-full object-contain bg-system-bg"
            />

            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-system-accent/50 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-system-accent/50 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-system-accent/50 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-system-accent/50 rounded-br-xl pointer-events-none" />

            {/* Upload Progress Overlay (while uploading) */}
            {status === 'uploading' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="text-system-accent animate-spin" />
                <div className="w-48 space-y-1.5 text-center">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-system-accent rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs font-mono text-system-accent">{progress}% جاري الرفع...</p>
                </div>
              </div>
            )}

            {/* Done Badge */}
            {status === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur rounded-full"
              >
                <CheckCircle2 size={11} className="text-white" />
                <span className="text-[10px] font-bold font-mono text-white uppercase tracking-wider">تم الرفع</span>
              </motion.div>
            )}

            {/* Verified badge (when imageUrl exists & not uploading) */}
            {imageUrl && status !== 'uploading' && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-system-accent/90 backdrop-blur rounded-full">
                <ShieldCheck size={11} className="text-black" />
                <span className="text-[10px] font-bold font-mono text-black uppercase tracking-wider">شهادة</span>
              </div>
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-250 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {/* Zoom */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsZoomed(true)}
                className="p-2.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                title="تكبير"
              >
                <ZoomIn size={16} />
              </motion.button>
              {/* Replace */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => inputRef.current?.click()}
                className="p-2.5 bg-system-accent/80 backdrop-blur border border-system-accent/40 text-black rounded-xl hover:bg-system-accent transition-colors"
                title="تغيير الصورة"
              >
                <Upload size={16} />
              </motion.button>
              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={removeImage}
                className="p-2.5 bg-red-500/80 backdrop-blur border border-red-400/30 text-white rounded-xl hover:bg-red-500 transition-colors"
                title="حذف الصورة"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
          </motion.div>

        ) : (
          /* ── Drop Zone ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
              dragOver
                ? 'border-system-accent bg-system-accent/10'
                : 'border-system-border hover:border-system-accent/60 hover:bg-system-accent/5'
            }`}
            style={{ aspectRatio: '16/9' }}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none flex items-center justify-center">
              <span className="text-[80px] font-mono font-black text-system-accent rotate-[-15deg]">CERT</span>
            </div>

            {/* Corner Decorations */}
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors ${dragOver ? 'border-system-accent/70' : 'border-system-border'}`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-colors ${dragOver ? 'border-system-accent/70' : 'border-system-border'}`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-colors ${dragOver ? 'border-system-accent/70' : 'border-system-border'}`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors ${dragOver ? 'border-system-accent/70' : 'border-system-border'}`} />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none px-6">
              <motion.div
                animate={dragOver ? { scale: 1.2, rotate: -8 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  dragOver
                    ? 'bg-system-accent/20 border-system-accent/50'
                    : 'bg-system-border border-system-border'
                }`}
              >
                <Award size={28} className={`transition-colors ${dragOver ? 'text-system-accent' : 'text-system-muted'}`} />
              </motion.div>

              <div className="text-center space-y-1.5">
                <p className={`text-sm font-mono font-medium transition-colors ${dragOver ? 'text-system-accent' : 'text-system-text'}`}>
                  {dragOver ? '✦ أفلت صورة الشهادة هنا' : 'ارفع صورة الشهادة'}
                </p>
                <p className="text-xs font-mono text-system-muted">
                  اسحب وأفلت أو اضغط للاختيار
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {['PNG', 'JPG', 'WEBP'].map(fmt => (
                    <span key={fmt} className="px-2 py-0.5 bg-system-border text-system-muted text-[10px] font-mono rounded uppercase">{fmt}</span>
                  ))}
                  <span className="text-system-muted/50 text-[10px] font-mono">• حد 10MB</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <AlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs font-mono text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative z-10 max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-xs font-mono text-system-muted">
                  <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse" />
                  <span className="uppercase tracking-widest">معاينة صورة الشهادة</span>
                </div>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-system-accent/30 shadow-2xl shadow-system-accent/20">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-system-accent/50 rounded-tl-2xl z-10" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-system-accent/50 rounded-tr-2xl z-10" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-system-accent/50 rounded-bl-2xl z-10" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-system-accent/50 rounded-br-2xl z-10" />
                <img src={currentImage} alt="الشهادة" className="w-full object-contain max-h-[70vh] bg-system-bg" />
              </div>
              <p className="text-center text-xs font-mono text-system-muted mt-3 opacity-60">
                اضغط خارج الصورة للإغلاق
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
