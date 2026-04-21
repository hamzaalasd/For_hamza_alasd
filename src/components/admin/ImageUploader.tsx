import { useState, useRef, useCallback } from 'react';
import type { DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Image, Loader2, CheckCircle2, AlertCircle, Trash2, GripVertical } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface ImageUploaderProps {
  projectId: string;
  images: string[];
  onChange: (images: string[]) => void;
}

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
}

export default function ImageUploader({ projectId, images, onChange }: ImageUploaderProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = URL.createObjectURL(file);
    const item: UploadItem = { id, file, preview, progress: 0, status: 'uploading' };
    setUploads(prev => [...prev, item]);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `projects/${projectId}/images/${id}.${ext}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);

    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        updateUpload(id, { progress: pct });
      },
      err => {
        updateUpload(id, { status: 'error', error: err.message });
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        updateUpload(id, { status: 'done', url, progress: 100 });
        onChange([...images, url]);
        // cleanup preview after done
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== id));
          URL.revokeObjectURL(preview);
        }, 1500);
      }
    );
  }, [projectId, images, onChange, updateUpload]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }, [uploadFile]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = async (url: string) => {
    // Try to delete from storage (best effort)
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const pathEncoded = urlObj.pathname.split('/o/')[1]?.split('?')[0];
      if (pathEncoded) {
        const path = decodeURIComponent(pathEncoded);
        const sRef = storageRef(storage, path);
        await deleteObject(sRef);
      }
    } catch {
      // ignore – URL may not be firebase storage
    }
    onChange(images.filter(u => u !== url));
  };

  const reorderImage = (from: number, to: number) => {
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        animate={dragOver ? { scale: 1.01 } : { scale: 1 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-system-accent bg-system-accent/10 scale-[1.01]'
            : 'border-system-border hover:border-system-accent/50 hover:bg-system-accent/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={`p-3 rounded-full transition-colors ${dragOver ? 'bg-system-accent/20' : 'bg-system-border'}`}>
            <Upload size={22} className={dragOver ? 'text-system-accent' : 'text-system-muted'} />
          </div>
          <div>
            <p className="text-sm font-mono text-system-text">
              {dragOver ? 'أفلت الصور هنا' : 'اسحب وأفلت الصور أو اضغط للاختيار'}
            </p>
            <p className="text-xs text-system-muted mt-1">PNG, JPG, WEBP • حد أقصى 10MB لكل صورة</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress Items */}
      <AnimatePresence>
        {uploads.map(u => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-3 bg-system-card border border-system-border rounded-xl"
          >
            <img src={u.preview} alt="" className="w-10 h-10 rounded-lg object-cover border border-system-border" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-system-text truncate">{u.file.name}</p>
              {u.status === 'uploading' && (
                <div className="mt-1.5">
                  <div className="h-1 bg-system-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-system-accent rounded-full"
                      animate={{ width: `${u.progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-system-muted mt-0.5 font-mono">{u.progress}%</p>
                </div>
              )}
              {u.status === 'error' && (
                <p className="text-[10px] text-red-400 mt-0.5 font-mono">{u.error}</p>
              )}
            </div>
            <div className="shrink-0">
              {u.status === 'uploading' && <Loader2 size={16} className="text-system-accent animate-spin" />}
              {u.status === 'done' && <CheckCircle2 size={16} className="text-emerald-400" />}
              {u.status === 'error' && <AlertCircle size={16} className="text-red-400" />}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono text-system-muted uppercase tracking-wider">
            الصور الحالية ({images.length}) — اسحب لإعادة الترتيب
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((url, i) => (
              <motion.div
                key={url}
                layout
                className="group relative aspect-square rounded-xl overflow-hidden border border-system-border bg-system-card"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />

                {/* Index badge */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/70 backdrop-blur text-white text-[10px] font-bold font-mono flex items-center justify-center">
                  {i + 1}
                </div>

                {/* Main badge */}
                {i === 0 && (
                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-system-accent text-black text-[9px] font-bold font-mono rounded">
                    MAIN
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  {i > 0 && (
                    <button
                      onClick={() => reorderImage(i, i - 1)}
                      title="جعلها الرئيسية"
                      className="p-1.5 bg-system-accent text-black rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity"
                    >
                      <Image size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(url)}
                    className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Drag handle hint */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-60 transition-opacity">
                  <GripVertical size={12} className="text-white" />
                </div>
              </motion.div>
            ))}

            {/* Add more placeholder */}
            <motion.div
              layout
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-system-border hover:border-system-accent/50 hover:bg-system-accent/5 flex items-center justify-center cursor-pointer transition-all group"
            >
              <div className="flex flex-col items-center gap-1 text-system-muted group-hover:text-system-accent transition-colors">
                <Upload size={18} />
                <span className="text-[10px] font-mono">إضافة</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
