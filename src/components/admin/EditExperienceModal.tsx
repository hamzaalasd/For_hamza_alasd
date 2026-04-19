import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Minus } from 'lucide-react';
import { Experience } from '../../data/portfolio';
import { useAdmin } from '../../context/AdminContext';

interface EditExperienceModalProps {
  experience?: Experience;
  mode: 'add' | 'edit';
  onClose: () => void;
}

const emptyExperience: Experience = {
  id: '',
  company: { ar: '', en: '' },
  role: { ar: '', en: '' },
  startDate: '',
  endDate: 'Present',
  description: { ar: '', en: '' },
  technologies: [],
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-system-accent uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors"
  />
);

const Textarea = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={3}
    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors resize-none"
  />
);

export default function EditExperienceModal({ experience, mode, onClose }: EditExperienceModalProps) {
  const { addExperience, updateExperience } = useAdmin();
  const [form, setForm] = useState<Experience>(
    experience ? JSON.parse(JSON.stringify(experience)) : { ...emptyExperience, id: Date.now().toString() }
  );
  const [techInput, setTechInput] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.role.en && !form.role.ar) return;
    if (mode === 'add') addExperience(form);
    else updateExperience(form);
    setSaved(true);
    setTimeout(onClose, 700);
  };

  const addTech = () => {
    if (techInput.trim()) {
      setForm(f => ({ ...f, technologies: [...f.technologies, techInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTech = (i: number) => {
    setForm(f => ({ ...f, technologies: f.technologies.filter((_, idx) => idx !== i) }));
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
              <h2 className="font-bold font-mono text-system-text">
                {mode === 'add' ? '++ ADD_EXPERIENCE' : 'EDIT :: EXPERIENCE'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="المسمى الوظيفي (عربي)">
                  <Input value={form.role.ar} onChange={v => setForm(f => ({ ...f, role: { ...f.role, ar: v } }))} placeholder="مهندس برمجيات..." />
                </Field>
                <Field label="Job Title (English)">
                  <Input value={form.role.en} onChange={v => setForm(f => ({ ...f, role: { ...f.role, en: v } }))} placeholder="Software Engineer..." />
                </Field>
                <Field label="اسم الجهة (عربي)">
                  <Input value={form.company.ar} onChange={v => setForm(f => ({ ...f, company: { ...f.company, ar: v } }))} placeholder="شركة..." />
                </Field>
                <Field label="Company Name (English)">
                  <Input value={form.company.en} onChange={v => setForm(f => ({ ...f, company: { ...f.company, en: v } }))} placeholder="Company..." />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="تاريخ البداية">
                  <Input value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} placeholder="2024-01" />
                </Field>
                <Field label="تاريخ النهاية">
                  <Input value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} placeholder="Present or 2025-06" />
                </Field>
              </div>

              <Field label="الوصف (عربي)">
                <Textarea value={form.description.ar} onChange={v => setForm(f => ({ ...f, description: { ...f.description, ar: v } }))} placeholder="وصف المهام والمسؤوليات..." />
              </Field>

              <Field label="Description (English)">
                <Textarea value={form.description.en} onChange={v => setForm(f => ({ ...f, description: { ...f.description, en: v } }))} placeholder="Describe your role and responsibilities..." />
              </Field>

              <Field label="التقنيات المستخدمة">
                <div className="flex gap-2 mb-2">
                  <input
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    placeholder="e.g. Laravel"
                    className="flex-1 px-3 py-2 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors font-mono"
                  />
                  <button onClick={addTech} className="px-3 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent rounded-lg hover:bg-system-accent hover:text-black transition-all">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.technologies.map((tech, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-system-border rounded-lg text-xs font-mono group">
                      {tech}
                      <button onClick={() => removeTech(i)} className="text-system-muted hover:text-red-400 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
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
                {saved ? 'SAVED ✓' : (mode === 'add' ? 'ADD EXPERIENCE' : 'SAVE CHANGES')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
