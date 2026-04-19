import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Project } from '../../data/portfolio';
import { useAdmin } from '../../context/AdminContext';

interface EditProjectModalProps {
  project?: Project;
  onClose: () => void;
  mode: 'edit' | 'add';
}

const emptyProject: Project = {
  id: Date.now().toString(),
  slug: 'new-project',
  title: { ar: '', en: '' },
  description: { ar: '', en: '' },
  problem: { ar: '', en: '' },
  techStack: [],
  metrics: [
    { label: { ar: '', en: '' }, value: '' },
  ],
  codeSnippet: '',
  architecture: '',
  type: 'web',
  status: 'development',
  githubUrl: '',
  demoUrl: '',
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-system-accent uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, mono = false, textarea = false }: any) =>
  textarea ? (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className={`w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors resize-none ${mono ? 'font-mono' : ''}`}
    />
  ) : (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text placeholder:text-system-muted/40 outline-none focus:border-system-accent transition-colors ${mono ? 'font-mono' : ''}`}
    />
  );

export default function EditProjectModal({ project, onClose, mode }: EditProjectModalProps) {
  const { updateProject, addProject } = useAdmin();
  const [form, setForm] = useState<Project>(project || { ...emptyProject, id: Date.now().toString() });
  const [techInput, setTechInput] = useState('');
  const [tab, setTab] = useState<'basic' | 'details' | 'code'>('basic');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.slug) return;
    if (mode === 'add') addProject(form);
    else updateProject(form);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const addTech = () => {
    if (techInput.trim()) {
      setForm(f => ({ ...f, techStack: [...f.techStack, techInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTech = (i: number) => {
    setForm(f => ({ ...f, techStack: f.techStack.filter((_, idx) => idx !== i) }));
  };

  const addMetric = () => {
    setForm(f => ({ ...f, metrics: [...f.metrics, { label: { ar: '', en: '' }, value: '' }] }));
  };

  const removeMetric = (i: number) => {
    setForm(f => ({ ...f, metrics: f.metrics.filter((_, idx) => idx !== i) }));
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
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-system-border bg-system-card overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-system-border shrink-0">
              <div>
                <h2 className="font-bold font-mono text-system-text">
                  {mode === 'add' ? '++ ADD_PROJECT' : `EDIT :: ${form.slug}`}
                </h2>
                <p className="text-[11px] text-system-muted font-mono mt-0.5">
                  Changes saved to localStorage automatically
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 shrink-0">
              {(['basic', 'details', 'code'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    tab === t
                      ? 'bg-system-accent text-black font-bold'
                      : 'text-system-muted hover:text-system-text hover:bg-system-border'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {tab === 'basic' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Slug (URL)">
                      <Input value={form.slug} onChange={(v: string) => setForm(f => ({ ...f, slug: v }))} placeholder="my-project" mono />
                    </Field>
                    <Field label="Type">
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                        className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors"
                      >
                        <option value="web">🌐 Web</option>
                        <option value="mobile">📱 Mobile</option>
                        <option value="fullstack">⚡ Fullstack</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                      className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors"
                    >
                      <option value="production">✅ In Production</option>
                      <option value="development">🔧 In Development</option>
                      <option value="completed">✔️ Completed</option>
                    </select>
                  </Field>

                  <Field label="Title (عربي)">
                    <Input value={form.title.ar} onChange={(v: string) => setForm(f => ({ ...f, title: { ...f.title, ar: v } }))} placeholder="اسم المشروع بالعربي" />
                  </Field>
                  <Field label="Title (English)">
                    <Input value={form.title.en} onChange={(v: string) => setForm(f => ({ ...f, title: { ...f.title, en: v } }))} placeholder="Project name in English" />
                  </Field>
                  <Field label="Description (عربي)">
                    <Input textarea value={form.description.ar} onChange={(v: string) => setForm(f => ({ ...f, description: { ...f.description, ar: v } }))} placeholder="وصف المشروع..." />
                  </Field>
                  <Field label="Description (English)">
                    <Input textarea value={form.description.en} onChange={(v: string) => setForm(f => ({ ...f, description: { ...f.description, en: v } }))} placeholder="Describe the project..." />
                  </Field>

                  {/* Links */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="GitHub URL">
                      <Input value={form.githubUrl || ''} onChange={(v: string) => setForm(f => ({ ...f, githubUrl: v }))} placeholder="https://github.com/..." mono />
                    </Field>
                    <Field label="Live Demo URL">
                      <Input value={form.demoUrl || ''} onChange={(v: string) => setForm(f => ({ ...f, demoUrl: v }))} placeholder="https://..." mono />
                    </Field>
                  </div>
                </>
              )}

              {tab === 'details' && (
                <>
                  <Field label="Problem & Solution (عربي)">
                    <Input textarea value={form.problem.ar} onChange={(v: string) => setForm(f => ({ ...f, problem: { ...f.problem, ar: v } }))} placeholder="المشكلة وكيف حللتها..." />
                  </Field>
                  <Field label="Problem & Solution (English)">
                    <Input textarea value={form.problem.en} onChange={(v: string) => setForm(f => ({ ...f, problem: { ...f.problem, en: v } }))} placeholder="The problem and how you solved it..." />
                  </Field>

                  <Field label="Architecture">
                    <Input value={form.architecture} onChange={(v: string) => setForm(f => ({ ...f, architecture: v }))} placeholder="e.g. Laravel MVC + Clean Architecture" mono />
                  </Field>

                  {/* Tech Stack */}
                  <Field label="Tech Stack">
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
                      {form.techStack.map((tech, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-system-border rounded-lg text-xs font-mono group">
                          {tech}
                          <button onClick={() => removeTech(i)} className="text-system-muted hover:text-red-400 transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </Field>

                  {/* Metrics */}
                  <Field label="Metrics">
                    <div className="space-y-2">
                      {form.metrics.map((metric, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            value={metric.label.ar}
                            onChange={e => setForm(f => ({ ...f, metrics: f.metrics.map((m, idx) => idx === i ? { ...m, label: { ...m.label, ar: e.target.value } } : m) }))}
                            placeholder="التسمية بالعربي"
                            className="flex-1 px-2.5 py-2 bg-system-bg border border-system-border rounded-lg text-xs text-system-text outline-none focus:border-system-accent transition-colors"
                          />
                          <input
                            value={metric.label.en}
                            onChange={e => setForm(f => ({ ...f, metrics: f.metrics.map((m, idx) => idx === i ? { ...m, label: { ...m.label, en: e.target.value } } : m) }))}
                            placeholder="Label in English"
                            className="flex-1 px-2.5 py-2 bg-system-bg border border-system-border rounded-lg text-xs text-system-text outline-none focus:border-system-accent transition-colors"
                          />
                          <input
                            value={metric.value}
                            onChange={e => setForm(f => ({ ...f, metrics: f.metrics.map((m, idx) => idx === i ? { ...m, value: e.target.value } : m) }))}
                            placeholder="Value"
                            className="w-24 px-2.5 py-2 bg-system-bg border border-system-border rounded-lg text-xs font-mono text-system-accent outline-none focus:border-system-accent transition-colors"
                          />
                          <button onClick={() => removeMetric(i)} className="p-2 text-system-muted hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button onClick={addMetric} className="w-full py-2 border border-dashed border-system-border hover:border-system-accent text-system-muted hover:text-system-accent rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1">
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                  </Field>
                </>
              )}

              {tab === 'code' && (
                <Field label="Code Snippet">
                  <textarea
                    value={form.codeSnippet}
                    onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))}
                    rows={12}
                    placeholder="// Paste your code snippet here..."
                    className="w-full px-4 py-3 bg-black border border-system-border rounded-xl text-sm text-system-accent font-mono outline-none focus:border-system-accent transition-colors resize-none"
                  />
                </Field>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-system-border shrink-0">
              <button onClick={onClose} className="px-4 py-2 text-sm font-mono text-system-muted hover:text-system-text transition-colors">
                CANCEL
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-mono transition-all ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-system-accent text-black hover:opacity-90'
                }`}
              >
                <Save size={14} />
                {saved ? 'SAVED ✓' : (mode === 'add' ? 'ADD PROJECT' : 'SAVE CHANGES')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
