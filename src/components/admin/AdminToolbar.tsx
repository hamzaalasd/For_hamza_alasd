import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, LogOut, RotateCcw, ChevronUp, ChevronDown,
  Briefcase, Award, BarChart2, User, AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface AdminToolbarProps {
  onEditBio: () => void;
  onNavigate: (section: string) => void;
  onAddProject: () => void;
  onAddCert: () => void;
  onAddSkill: () => void;
  onAddExperience: () => void;
  activeSection: string;
  language: 'ar' | 'en';
}

export default function AdminToolbar({ onEditBio, onNavigate, onAddProject, onAddCert, onAddSkill, onAddExperience, activeSection, language }: AdminToolbarProps) {
  const { logout, resetToDefault, projects, certifications, skills } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    setShowResetConfirm(false);
    resetToDefault();
  };

  return (
    <>
      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative z-10 p-6 bg-system-card border border-red-500/30 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl shadow-red-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle size={22} />
                <h3 className="font-bold font-mono">CONFIRM_RESET</h3>
              </div>
              <p className="text-system-muted text-sm leading-relaxed">
                {language === 'ar'
                  ? 'سيتم حذف جميع التعديلات المحفوظة والرجوع للبيانات الافتراضية. هذا الإجراء لا يمكن التراجع عنه.'
                  : 'All saved changes will be deleted and data reset to defaults. This cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold font-mono text-sm rounded-xl hover:bg-red-600 transition-colors"
                >
                  RESET_ALL
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 border border-system-border text-system-muted font-mono text-sm rounded-xl hover:bg-system-border transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-12 left-4 z-[80] select-none"
        style={{ direction: 'ltr' }}
      >
        <div className="rounded-2xl border border-system-accent/40 bg-system-card/95 backdrop-blur-xl shadow-2xl shadow-system-accent/20 overflow-hidden min-w-[200px]">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer bg-system-accent/10 border-b border-system-accent/20"
            onClick={() => setCollapsed(v => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse" />
              <ShieldCheck size={14} className="text-system-accent" />
              <span className="text-xs font-bold font-mono text-system-accent">ADMIN_MODE</span>
            </div>
            <button className="text-system-muted hover:text-system-text transition-colors">
              {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-1">
                  {/* Quick nav */}
                  <p className="text-[9px] font-mono text-system-muted uppercase tracking-widest px-2 pb-1">Quick Edit</p>

                  <NavBtn
                    icon={<User size={13} />}
                    label={language === 'ar' ? 'تعديل Bio' : 'Edit Bio'}
                    active={activeSection === 'bio'}
                    onClick={onEditBio}
                    accent
                  />

                  <NavBtn
                    icon={<Briefcase size={13} />}
                    label={language === 'ar' ? 'المشاريع' : 'Projects'}
                    active={activeSection.startsWith('project-')}
                    onClick={() => onNavigate('project-edas')}
                    badge={projects.length}
                  />

                  <NavBtn
                    icon={<Award size={13} />}
                    label={language === 'ar' ? 'الشهادات' : 'Certifications'}
                    active={activeSection === 'certifications'}
                    onClick={() => onNavigate('certifications')}
                    badge={certifications.length}
                  />

                  <NavBtn
                    icon={<BarChart2 size={13} />}
                    label={language === 'ar' ? 'المهارات' : 'Skills'}
                    active={activeSection === 'skills'}
                    onClick={() => onNavigate('skills')}
                    badge={skills.length}
                  />

                  <p className="text-[9px] font-mono text-system-muted uppercase tracking-widest px-2 pt-2 pb-1 border-t border-system-border/50">Add New</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <ActionButton icon={<Briefcase size={12} />} label={language === 'ar' ? '+ مشروع' : '+ Project'} onClick={onAddProject} />
                    <ActionButton icon={<Award size={12} />} label={language === 'ar' ? '+ شهادة' : '+ Cert'} onClick={onAddCert} />
                    <ActionButton icon={<BarChart2 size={12} />} label={language === 'ar' ? '+ مهارة' : '+ Skill'} onClick={onAddSkill} />
                    <ActionButton icon={<User size={12} />} label={language === 'ar' ? '+ خبرة' : '+ Exp'} onClick={onAddExperience} />
                  </div>

                  <div className="h-px bg-system-border my-2" />

                  {/* Actions */}
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-system-muted hover:text-red-400 hover:bg-red-400/5 transition-all"
                  >
                    <RotateCcw size={12} />
                    {language === 'ar' ? 'إعادة ضبط' : 'Reset to Default'}
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-system-muted hover:text-system-text hover:bg-system-border transition-all"
                  >
                    <LogOut size={12} />
                    {language === 'ar' ? 'تسجيل الخروج' : 'Exit Admin Mode'}
                  </button>
                </div>

                {/* Tip */}
                <div className="px-4 py-2 border-t border-system-border/50 bg-system-bg/30">
                  <p className="text-[9px] font-mono text-system-muted/60 leading-relaxed">
                    {language === 'ar'
                      ? '✏️ اضغط على أي عنصر في الصفحة لتعديله'
                      : '✏️ Click any element on page to edit it'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function NavBtn({ icon, label, active, onClick, badge, accent }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
        active
          ? 'bg-system-accent/15 text-system-accent'
          : 'text-system-muted hover:text-system-text hover:bg-system-border/60'
      } ${accent ? 'border border-system-accent/20' : ''}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="px-1.5 py-0.5 bg-system-accent/10 text-system-accent rounded-full text-[9px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-2 bg-system-bg border border-system-border rounded hover:border-system-accent hover:text-system-accent text-system-text transition-all"
    >
      {icon}
      <span className="text-[10px] font-mono whitespace-nowrap">{label}</span>
    </button>
  );
}
