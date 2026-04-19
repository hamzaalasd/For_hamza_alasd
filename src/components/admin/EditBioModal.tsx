import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Minus } from 'lucide-react';
import { BioData, useAdmin } from '../../context/AdminContext';

interface EditBioModalProps {
  bio: BioData;
  onClose: () => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-system-accent uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }: any) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors"
  />
);

const Textarea = ({ value, onChange, placeholder }: any) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={3}
    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors resize-none"
  />
);

export default function EditBioModal({ bio, onClose }: EditBioModalProps) {
  const { updateBio } = useAdmin();
  const [form, setForm] = useState<BioData>(JSON.parse(JSON.stringify(bio)));
  const [saved, setSaved] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
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
        
        // Use high-quality image smoothing
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Increase quality to 0.92 for much sharper retina display output
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setForm(f => ({ ...f, avatarUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateBio(form);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const addStat = () => {
    setForm(f => ({
      ...f,
      stats: [...f.stats, { numAr: '', numEn: '', labelAr: '', labelEn: '' }],
    }));
  };

  const removeStat = (i: number) => {
    setForm(f => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));
  };

  const updateStat = (i: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      stats: f.stats.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-system-border bg-system-card overflow-hidden flex flex-col">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-system-accent to-transparent" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-system-border">
              <h2 className="font-bold font-mono text-system-text">EDIT :: BIO_SECTION</h2>
              <button onClick={onClose} className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="الاسم (عربي)">
                  <Input value={form.nameAr} onChange={(v: string) => setForm(f => ({ ...f, nameAr: v }))} placeholder="الاسم بالعربي" />
                </Field>
                <Field label="Name (English)">
                  <Input value={form.nameEn} onChange={(v: string) => setForm(f => ({ ...f, nameEn: v }))} placeholder="Name in English" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="المسمى الوظيفي (عربي)">
                  <Input value={form.titleAr} onChange={(v: string) => setForm(f => ({ ...f, titleAr: v }))} placeholder="المسمى الوظيفي..." />
                </Field>
                <Field label="Job Title (English)">
                  <Input value={form.titleEn} onChange={(v: string) => setForm(f => ({ ...f, titleEn: v }))} placeholder="Job title..." />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-system-border/50 pt-4 mt-4">
                <Field label="اسم تبويب الموقع (العنوان يظهر في المتصفح)">
                  <Input value={form.seoTitleAr || ''} onChange={(v: string) => setForm(f => ({ ...f, seoTitleAr: v }))} placeholder="حمزة الأسد | مطور..." />
                </Field>
                <Field label="Website Tab Title (Browser Title)">
                  <Input value={form.seoTitleEn || ''} onChange={(v: string) => setForm(f => ({ ...f, seoTitleEn: v }))} placeholder="Hamza | Software Dev..." />
                </Field>
              </div>

              <Field label="الوصف (عربي)">
                <Textarea value={form.descriptionAr} onChange={(v: string) => setForm(f => ({ ...f, descriptionAr: v }))} placeholder="وصفك المهني بالعربي..." />
              </Field>

              <Field label="Description (English)">
                <Textarea value={form.descriptionEn} onChange={(v: string) => setForm(f => ({ ...f, descriptionEn: v }))} placeholder="Your professional description..." />
              </Field>

              {/* Avatar & Contact Info */}
              <Field label="صورة البروفايل (رفع من الجهاز أو رابط)">
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 px-3 py-2 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-system-accent file:text-black hover:file:bg-system-accent/80 file:cursor-pointer"
                  />
                  <span className="text-xs text-system-muted">أو ضِف رابط:</span>
                  <input
                    value={form.avatarUrl || ''}
                    onChange={(e) => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-1/3 px-3 py-2 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="WhatsApp">
                  <Input value={form.whatsapp || ''} onChange={(v: string) => setForm(f => ({ ...f, whatsapp: v }))} placeholder="+1234567890" />
                </Field>
                <Field label="Email">
                  <Input value={form.email || ''} onChange={(v: string) => setForm(f => ({ ...f, email: v }))} placeholder="hello@example.com" />
                </Field>
                <Field label="GitHub">
                  <Input value={form.github || ''} onChange={(v: string) => setForm(f => ({ ...f, github: v }))} placeholder="https://github.com/..." />
                </Field>
                <Field label="LinkedIn">
                  <Input value={form.linkedin || ''} onChange={(v: string) => setForm(f => ({ ...f, linkedin: v }))} placeholder="https://linkedin.com/..." />
                </Field>
              </div>

              {/* Stats */}
              <Field label="Stats / الإحصائيات">
                <div className="space-y-2">
                  {form.stats.map((stat, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <input
                        value={stat.numAr}
                        onChange={e => updateStat(i, 'numAr', e.target.value)}
                        placeholder="+5"
                        className="px-2 py-2 bg-system-bg border border-system-border rounded-lg text-xs text-system-accent font-bold font-mono text-center outline-none focus:border-system-accent"
                      />
                      <input
                        value={stat.labelAr}
                        onChange={e => updateStat(i, 'labelAr', e.target.value)}
                        placeholder="مشروع منتج"
                        className="col-span-2 px-2 py-2 bg-system-bg border border-system-border rounded-lg text-xs text-system-text outline-none focus:border-system-accent"
                      />
                      <input
                        value={stat.labelEn}
                        onChange={e => updateStat(i, 'labelEn', e.target.value)}
                        placeholder="Live Projects"
                        className="col-span-1 px-2 py-2 bg-system-bg border border-system-border rounded-lg text-xs text-system-text outline-none focus:border-system-accent"
                      />
                      <button
                        onClick={() => removeStat(i)}
                        className="p-2 text-system-muted hover:text-red-400 transition-colors flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addStat}
                    className="w-full py-2 border border-dashed border-system-border hover:border-system-accent text-system-muted hover:text-system-accent rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={12} /> Add Stat
                  </button>
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-system-border">
              <button onClick={onClose} className="px-4 py-2 text-sm font-mono text-system-muted hover:text-system-text transition-colors">CANCEL</button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-mono transition-all ${
                  saved ? 'bg-emerald-500 text-white' : 'bg-system-accent text-black hover:opacity-90'
                }`}
              >
                <Save size={14} />
                {saved ? 'SAVED ✓' : 'SAVE BIO'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
