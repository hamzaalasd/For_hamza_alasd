import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images, Expand } from 'lucide-react';
import { Language } from '@/src/data/portfolio';

interface ProjectImageGalleryProps {
  images: string[];
  language: Language;
  projectTitle: string;
}

export default function ProjectImageGallery({ images, language, projectTitle }: ProjectImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const openLightbox = (i: number) => {
    setActiveIndex(i);
    setZoomed(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomed(false);
  };

  const prev = useCallback(() => {
    setZoomed(false);
    setActiveIndex(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setZoomed(false);
    setActiveIndex(i => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, prev, next]);

  if (!images || images.length === 0) return null;

  const isRtl = language === 'ar';

  // Layout: first image is hero (full width), rest in adaptive grid
  const [hero, ...rest] = images;

  return (
    <>
      <section className="space-y-4">
        {/* Section Header */}
        <h2 className="flex items-center gap-2 font-mono text-system-accent uppercase tracking-wider text-sm font-bold">
          <Images size={16} />
          {isRtl ? '// معرض الصور' : '// Project Gallery'}
          <span className="ml-auto text-xs text-system-muted font-normal normal-case">
            {images.length} {isRtl ? 'صورة' : 'image(s)'}
          </span>
        </h2>

        <div className="space-y-3">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl border border-system-border cursor-zoom-in"
            style={{ aspectRatio: '16/7' }}
            onClick={() => openLightbox(0)}
          >
            <img
              src={hero}
              alt={`${projectTitle} – 1`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 text-white text-xs font-mono">
              <Expand size={14} />
              <span>{isRtl ? 'عرض بالكامل' : 'View Full'}</span>
            </div>
            {/* Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-system-accent text-black text-[10px] font-bold font-mono rounded-full">
              {isRtl ? 'الرئيسية' : 'MAIN'}
            </div>
          </motion.div>

          {/* Grid for rest */}
          {rest.length > 0 && (
            <div
              className={`grid gap-3 ${
                rest.length === 1 ? 'grid-cols-1' :
                rest.length === 2 ? 'grid-cols-2' :
                rest.length === 3 ? 'grid-cols-3' :
                'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {rest.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i + 1) * 0.07 }}
                  className="group relative overflow-hidden rounded-xl border border-system-border cursor-zoom-in bg-system-card"
                  style={{ aspectRatio: rest.length <= 2 ? '16/9' : '1/1' }}
                  onClick={() => openLightbox(i + 1)}
                >
                  <img
                    src={src}
                    alt={`${projectTitle} – ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn
                      size={22}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
                    />
                  </div>
                  {/* Dot indicator on hover */}
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-system-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Thumbnail strip (shown when >4 images) */}
          {images.length > 4 && (
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => openLightbox(i)}
                  className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIndex && lightboxOpen
                      ? 'border-system-accent scale-105'
                      : 'border-system-border hover:border-system-accent/50'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ LIGHTBOX ═══════════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 z-10 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-5 z-10 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-white text-xs font-mono">
              {activeIndex + 1} / {images.length}
            </div>

            {/* Title */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-mono hidden sm:block">
              {projectTitle}
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prev(); }}
                  className={`absolute z-10 p-3 bg-white/10 hover:bg-white/25 backdrop-blur rounded-full text-white transition-all hover:scale-110 ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`}
                >
                  {isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); next(); }}
                  className={`absolute z-10 p-3 bg-white/10 hover:bg-white/25 backdrop-blur rounded-full text-white transition-all hover:scale-110 ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}
                >
                  {isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
              </>
            )}

            {/* Main Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.92, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: -40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="relative z-10 flex items-center justify-center max-w-5xl max-h-[80vh] px-16"
                onClick={e => e.stopPropagation()}
              >
                <motion.img
                  src={images[activeIndex]}
                  alt={`${projectTitle} – ${activeIndex + 1}`}
                  animate={{ scale: zoomed ? 1.8 : 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 24 }}
                  onClick={() => setZoomed(z => !z)}
                  className={`max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                />
              </motion.div>
            </AnimatePresence>

            {/* Dot nav */}
            {images.length > 1 && images.length <= 12 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActiveIndex(i); setZoomed(false); }}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeIndex
                        ? 'w-6 h-2 bg-system-accent'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip in lightbox */}
            {images.length > 2 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-lg overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={e => { e.stopPropagation(); setActiveIndex(i); setZoomed(false); }}
                    className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      i === activeIndex ? 'border-system-accent scale-110' : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-3 right-5 z-10 text-white/30 text-[10px] font-mono hidden sm:block">
              {isRtl ? 'اضغط على الصورة للتكبير • ← → للتنقل • Esc للإغلاق' : 'Click image to zoom • ← → navigate • Esc close'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
