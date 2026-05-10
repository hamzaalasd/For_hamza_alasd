import { useState, useRef, useCallback } from 'react';
import type { DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, X, Loader2, CheckCircle2, AlertCircle,
  ImagePlus, Trash2, ZoomIn, Award, ShieldCheck
} from 'lucide-react';

interface CertImageUploaderProps {
  certId: string;
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
}

type UploadStatus = 'idle' | 'processing' | 'done' | 'error';

export default function CertImageUploader({ certId, imageUrl, onChange }: CertImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('الملف يجب أن يكون صورة (PNG، JPG، WEBP)');
      return;
    }
    
    setError(null);
    setStatus('processing');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Increase max size slightly for certificates to retain text readability
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // High quality JPEG compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(dataUrl);
        setStatus('done');
      };
      img.onerror = () => {
        setStatus('error');
        setError('فشل في قراءة الصورة');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setStatus('error');
      setError('حدث خطأ أثناء قراءة الملف');
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) processFile(files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = () => {
    onChange(undefined);
    setStatus('idle');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-system-accent uppercase tracking-wider">
          <ImagePlus size={13} />
          <span>صورة الشهادة (اختياري)</span>
        </div>
        <div className="h-px flex-1 bg-system-border" />
      </div>

      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative group rounded-xl overflow-hidden border border-system-border bg-system-card"
            style={{ aspectRatio: '16/9' }}
          >
            <img
              src={imageUrl}
              alt="صورة الشهادة"
              className="w-full h-full object-contain bg-system-bg"
            />

            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-system-accent/50 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-system-accent/50 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-system-accent/50 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-system-accent/50 rounded-br-xl pointer-events-none" />

            {status === 'processing' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="text-system-accent animate-spin" />
                <p className="text-xs font-mono text-system-accent">جاري المعالجة...</p>
              </div>
            )}

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

            {status !== 'processing' && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-250 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsZoomed(true)}
                  className="p-2.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                  title="تكبير"
                >
                  <ZoomIn size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => inputRef.current?.click()}
                  className="p-2.5 bg-system-accent/80 backdrop-blur border border-system-accent/40 text-black rounded-xl hover:bg-system-accent transition-colors"
                  title="تغيير الصورة"
                >
                  <Upload size={16} />
                </motion.button>
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
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
          </motion.div>
        ) : (
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
                {status === 'processing' ? (
                  <Loader2 size={28} className="text-system-accent animate-spin" />
                ) : (
                  <Award size={28} className={`transition-colors ${dragOver ? 'text-system-accent' : 'text-system-muted'}`} />
                )}
              </motion.div>

              <div className="text-center space-y-1.5">
                <p className={`text-sm font-mono font-medium transition-colors ${dragOver ? 'text-system-accent' : 'text-system-text'}`}>
                  {status === 'processing' ? 'جاري المعالجة والرفع...' : (dragOver ? '✦ أفلت صورة الشهادة هنا' : 'ارفع صورة الشهادة أو استخدم الرابط')}
                </p>
                <p className="text-xs font-mono text-system-muted">
                  اسحب وأفلت أو اضغط للاختيار
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Link Fallback/Option */}
      {!imageUrl && (
        <div className="pt-2">
          <input
            value={imageUrl || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="أو ضِف رابط الصورة هنا (https://...)"
            className="w-full px-3 py-2 text-xs bg-system-bg border border-system-border rounded-lg text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors"
          />
        </div>
      )}

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

      <AnimatePresence>
        {isZoomed && imageUrl && (
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
              <div className="relative rounded-2xl overflow-hidden border border-system-accent/30 shadow-2xl shadow-system-accent/20">
                <img src={imageUrl} alt="الشهادة" className="w-full object-contain max-h-[70vh] bg-system-bg" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
