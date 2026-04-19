import { motion } from 'motion/react';
import { Briefcase, Calendar, Code2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Experience, Language } from '../data/portfolio';

interface ExperienceTimelineProps {
  experiences: Experience[];
  language: Language;
  isAdmin: boolean;
  onEdit: (exp: Experience) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function formatDate(dateStr: string, language: Language) {
  if (dateStr.toLowerCase() === 'present') {
    return language === 'ar' ? 'حتى الآن' : 'Present';
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function ExperienceTimeline({ experiences, language, isAdmin, onEdit, onDelete, onAdd }: ExperienceTimelineProps) {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ar' ? 'مسيرتي المهنية' : 'Work Experience'}
          </h1>
          <p className="text-system-muted">
            {language === 'ar'
              ? 'سجل الخبرات والمشاريع المهنية على مدار المسيرة.'
              : 'Professional experience log and career milestones.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent font-mono text-xs rounded-xl hover:bg-system-accent hover:text-black transition-all"
          >
            <Plus size={13} /> {language === 'ar' ? 'إضافة خبرة' : 'Add Experience'}
          </button>
        )}
      </header>

      {experiences.length === 0 ? (
        <div className="p-12 border border-dashed border-system-border rounded-xl text-center space-y-3">
          <Briefcase size={32} className="mx-auto text-system-muted/40" />
          <p className="text-system-muted font-mono text-sm">
            {language === 'ar' ? '// لا توجد خبرات مضافة بعد' : '// No experience entries yet'}
          </p>
          {isAdmin && (
            <button
              onClick={onAdd}
              className="mt-2 px-5 py-2 bg-system-accent text-black font-bold rounded text-sm hover:opacity-90 transition-opacity"
            >
              {language === 'ar' ? 'أضف أول خبرة' : 'Add First Experience'}
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-system-border rtl:left-auto rtl:right-[11px]" />

          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative pl-8 rtl:pl-0 rtl:pr-8 group"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-system-card border-2 border-system-accent flex items-center justify-center rtl:left-auto rtl:right-0">
                  <div className="w-2 h-2 rounded-full bg-system-accent" />
                </div>

                <div className="p-5 bg-system-card border border-system-border rounded-xl hover:border-system-accent/30 transition-colors space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-system-text">
                        {language === 'ar' ? exp.role.ar : exp.role.en}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-system-muted font-mono mt-0.5">
                        <Briefcase size={13} className="text-system-accent" />
                        <span>{language === 'ar' ? exp.company.ar : exp.company.en}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-system-muted px-2 py-1 bg-system-bg border border-system-border rounded-lg">
                        <Calendar size={11} className="text-system-accent" />
                        <span>
                          {formatDate(exp.startDate, language)} — {formatDate(exp.endDate, language)}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(exp)}
                            className="p-1.5 rounded text-system-muted hover:text-system-accent hover:bg-system-accent/10 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => { if (confirm('حذف هذه الخبرة؟')) onDelete(exp.id); }}
                            className="p-1.5 rounded text-system-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {(exp.description.ar || exp.description.en) && (
                    <p className="text-system-muted text-sm leading-relaxed">
                      {language === 'ar' ? exp.description.ar : exp.description.en}
                    </p>
                  )}

                  {/* Technologies */}
                  {exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-mono bg-system-border rounded text-system-muted">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
