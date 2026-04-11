import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { Certification } from '../../data/portfolio';
import { useAdmin } from '../../context/AdminContext';

interface EditCertModalProps {
  cert?: Certification;
  onClose: () => void;
  mode: 'edit' | 'add';
}

const emptyCert: Certification = {
  id: '',
  issuer: '',
  title: { ar: '', en: '' },
  date: new Date().toISOString().split('T')[0],
  verifyUrl: 'https://',
  tech: '',
  credentialId: '',
};

const TECH_OPTIONS = ['Laravel', 'Flutter', 'MySQL', 'PHP', 'JavaScript', 'Python', 'Docker', 'Architecture', 'React', 'Other'];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-system-accent uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }: any) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors"
  />
);

export default function EditCertModal({ cert, onClose, mode }: EditCertModalProps) {
  const { updateCert, addCert } = useAdmin();
  const [form, setForm] = useState<Certification>(
    cert || { ...emptyCert, id: Date.now().toString() }
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.title.ar && !form.title.en) return;
    if (mode === 'add') addCert(form);
    else updateCert(form);
    setSaved(true);
    setTimeout(onClose, 800);
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
          className="relative z-10 w-full max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-system-border bg-system-card overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-system-accent to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-system-border">
              <h2 className="font-bold font-mono text-system-text">
                {mode === 'add' ? '++ ADD_CERT' : 'EDIT_CERT'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Issuer (الجهة)">
                  <Input
                    value={form.issuer}
                    onChange={(v: string) => setForm(f => ({ ...f, issuer: v }))}
                    placeholder="e.g. Udemy"
                  />
                </Field>
                <Field label="Tech">
                  <select
                    value={form.tech}
                    onChange={e => setForm(f => ({ ...f, tech: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors"
                  >
                    <option value="">-- Select Tech --</option>
                    {TECH_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Title (عربي)">
                <Input
                  value={form.title.ar}
                  onChange={(v: string) => setForm(f => ({ ...f, title: { ...f.title, ar: v } }))}
                  placeholder="عنوان الشهادة بالعربي"
                />
              </Field>

              <Field label="Title (English)">
                <Input
                  value={form.title.en}
                  onChange={(v: string) => setForm(f => ({ ...f, title: { ...f.title, en: v } }))}
                  placeholder="Certificate title in English"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date (التاريخ)">
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(v: string) => setForm(f => ({ ...f, date: v }))}
                  />
                </Field>
                <Field label="Credential ID">
                  <Input
                    value={form.credentialId || ''}
                    onChange={(v: string) => setForm(f => ({ ...f, credentialId: v }))}
                    placeholder="UC-XXXX-2025"
                  />
                </Field>
              </div>

              <Field label="Verify URL (رابط التحقق)">
                <Input
                  value={form.verifyUrl}
                  onChange={(v: string) => setForm(f => ({ ...f, verifyUrl: v }))}
                  placeholder="https://www.udemy.com/certificate/..."
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-system-border">
              <button onClick={onClose} className="px-4 py-2 text-sm font-mono text-system-muted hover:text-system-text transition-colors">
                CANCEL
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-mono transition-all ${
                  saved ? 'bg-emerald-500 text-white' : 'bg-system-accent text-black hover:opacity-90'
                }`}
              >
                <Save size={14} />
                {saved ? 'SAVED ✓' : (mode === 'add' ? 'ADD CERT' : 'SAVE')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
