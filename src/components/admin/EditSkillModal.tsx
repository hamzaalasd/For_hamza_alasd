import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Skill } from '../../data/portfolio';
import { useAdmin } from '../../context/AdminContext';

interface EditSkillModalProps {
  skill?: Skill;
  onClose: () => void;
  mode: 'edit' | 'add';
  allSkillIds: string[];
}

const emptySkill: Skill = {
  id: '',
  name: '',
  category: 'backend',
  level: 80,
  dependencies: [],
};

export default function EditSkillModal({ skill, onClose, mode, allSkillIds }: EditSkillModalProps) {
  const { updateSkill, addSkill } = useAdmin();
  const [form, setForm] = useState<Skill>(
    skill || { ...emptySkill, id: Date.now().toString() }
  );
  const [saved, setSaved] = useState(false);
  const [depInput, setDepInput] = useState('');

  const handleSave = () => {
    if (!form.name) return;
    if (mode === 'add') addSkill(form);
    else updateSkill(form);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const addDep = () => {
    if (depInput && !form.dependencies.includes(depInput)) {
      setForm(f => ({ ...f, dependencies: [...f.dependencies, depInput] }));
      setDepInput('');
    }
  };

  const removeDep = (dep: string) => {
    setForm(f => ({ ...f, dependencies: f.dependencies.filter(d => d !== dep) }));
  };

  const CATEGORIES = ['backend', 'frontend', 'mobile', 'devops', 'architecture'];

  const categoryColors: Record<string, string> = {
    backend: 'text-red-400',
    frontend: 'text-blue-400',
    mobile: 'text-purple-400',
    devops: 'text-yellow-400',
    architecture: 'text-emerald-400',
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
          className="relative z-10 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-system-border bg-system-card overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-system-accent to-transparent" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-system-border">
              <h2 className="font-bold font-mono text-system-text">
                {mode === 'add' ? '++ ADD_SKILL' : `EDIT :: ${form.name}`}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name & ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-system-accent uppercase tracking-wider">Skill Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Laravel"
                    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-system-accent uppercase tracking-wider">ID (unique)</label>
                  <input
                    value={form.id}
                    onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="e.g. laravel"
                    className="w-full px-3 py-2.5 bg-system-bg border border-system-border rounded-lg text-sm font-mono text-system-text outline-none focus:border-system-accent transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-system-accent uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat as Skill['category'] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                        form.category === cat
                          ? 'bg-system-accent text-black border-system-accent font-bold'
                          : 'border-system-border text-system-muted hover:border-system-accent/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-system-accent uppercase tracking-wider">Level</label>
                  <span className="text-system-accent font-bold font-mono text-sm">{form.level}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: Number(e.target.value) }))}
                  className="w-full h-2 bg-system-border rounded-full appearance-none cursor-pointer accent-system-accent"
                />
                <div className="flex justify-between text-[10px] font-mono text-system-muted/50">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>

              {/* Visual level bar */}
              <div className="h-2 bg-system-border rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${form.level}%` }}
                  className="h-full bg-system-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 200 }}
                />
              </div>

              {/* Dependencies */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-system-accent uppercase tracking-wider">Dependencies</label>
                <div className="flex gap-2">
                  <select
                    value={depInput}
                    onChange={e => setDepInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-system-bg border border-system-border rounded-lg text-sm text-system-text outline-none focus:border-system-accent transition-colors font-mono"
                  >
                    <option value="">-- Select dependency --</option>
                    {allSkillIds.filter(id => id !== form.id && !form.dependencies.includes(id)).map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                  <button onClick={addDep} className="px-3 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent rounded-lg hover:bg-system-accent hover:text-black transition-all">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.dependencies.map(dep => (
                    <span key={dep} className="flex items-center gap-1.5 px-2.5 py-1 bg-system-border rounded-lg text-xs font-mono">
                      {dep}
                      <button onClick={() => removeDep(dep)} className="text-system-muted hover:text-red-400 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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
                {saved ? 'SAVED ✓' : (mode === 'add' ? 'ADD SKILL' : 'SAVE')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
