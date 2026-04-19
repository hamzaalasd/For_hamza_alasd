import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Globe, Github, Linkedin, Mail, Menu, X, Pencil, Plus, Trash2, FileDown } from 'lucide-react';
import TerminalBoot from './components/TerminalBoot';
import FileTree from './components/FileTree';
import ProjectPanel from './components/ProjectPanel';
import SkillsGraph from './components/SkillsGraph';
import CertTimeline from './components/CertTimeline';
import TerminalCLI from './components/TerminalCLI';
import GitHubStats from './components/GitHubStats';
import { Language } from './data/portfolio';
import { cn } from './lib/utils';
import { AdminProvider, useAdmin } from './context/AdminContext';
import PasswordModal from './components/admin/PasswordModal';
import AdminToolbar from './components/admin/AdminToolbar';
import EditProjectModal from './components/admin/EditProjectModal';
import EditCertModal from './components/admin/EditCertModal';
import EditSkillModal from './components/admin/EditSkillModal';
import EditBioModal from './components/admin/EditBioModal';
import EditExperienceModal from './components/admin/EditExperienceModal';
import ExperienceTimeline from './components/ExperienceTimeline';
import ResumePrintView from './components/ResumePrintView';

// ─── EditButton helper ────────────────────────
function EditBtn({ onClick, label = 'Edit', danger = false }: { onClick: (e: React.MouseEvent) => void; label?: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all opacity-0 group-hover:opacity-100 border',
        danger
          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white'
          : 'bg-system-accent/10 border-system-accent/30 text-system-accent hover:bg-system-accent hover:text-black'
      )}
    >
      {danger ? <Trash2 size={10} /> : <Pencil size={10} />}
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP INNER (inside AdminProvider)
// ═══════════════════════════════════════════════════════
function AppInner() {
  const {
    isAdmin, loading, projects, skills, certifications, bio, experiences, visitors,
    deleteProject, deleteCert, deleteSkill, deleteExperience,
  } = useAdmin();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-system-bg">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-system-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-system-muted font-mono text-sm">LOADING_DATA...</p>
        </div>
      </div>
    );
  }

  const [booting, setBooting] = useState(true);
  const [language, setLanguage] = useState<Language>('ar');
  const [activeSection, setActiveSection] = useState('bio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  // Admin UI states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingProject, setEditingProject] = useState<{ project?: any; mode: 'edit' | 'add' } | null>(null);
  const [editingCert, setEditingCert] = useState<{ cert?: any; mode: 'edit' | 'add' } | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ skill?: any; mode: 'edit' | 'add' } | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [editingExperience, setEditingExperience] = useState<{ exp?: any; mode: 'edit' | 'add' } | null>(null);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  // Secret trigger: click the green dot 5 times in ≤3s
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic Document Title Sync
  useEffect(() => {
    const defaultTitle = language === 'ar' ? `${bio.nameAr} | ${bio.titleAr}` : `${bio.nameEn} | ${bio.titleEn}`;
    document.title = language === 'ar' ? (bio.seoTitleAr || defaultTitle) : (bio.seoTitleEn || defaultTitle);
  }, [bio.seoTitleAr, bio.seoTitleEn, bio.nameAr, bio.nameEn, bio.titleAr, bio.titleEn, language]);

  const handleSecretClick = useCallback(() => {
    if (isAdmin) return; // already in admin
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 3000);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setShowPasswordModal(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');

  if (booting) {
    return <TerminalBoot language={language} onComplete={() => setBooting(false)} />;
  }

  // ── Admin-aware wrapper ────────────────────────
  const AdminWrapper = ({ children, onEdit, onDelete, className = '' }: {
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
  }) => {
    if (!isAdmin) return <>{children}</>;
    return (
      <div className={cn('relative group', className)}>
        {children}
        {/* Hover border */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-system-accent/30 pointer-events-none transition-all" />
        {/* Buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5 z-20">
          {onEdit && <EditBtn onClick={e => { e.stopPropagation(); onEdit(); }} label="Edit" />}
          {onDelete && <EditBtn danger onClick={e => { e.stopPropagation(); onDelete(); }} label="Del" />}
        </div>
      </div>
    );
  };

  // ── renderContent ─────────────────────────────
  const renderContent = () => {
    if (activeSection.startsWith('project-')) {
      const slug = activeSection.replace('project-', '');
      const project = projects.find(p => p.slug === slug);
      if (!project) return null;
      return (
        <AdminWrapper
          onEdit={() => setEditingProject({ project, mode: 'edit' })}
          onDelete={() => { if (confirm(`حذف مشروع "${project.title[language]}"؟`)) { deleteProject(project.id); setActiveSection('bio'); } }}
        >
          <ProjectPanel project={project} language={language} />
        </AdminWrapper>
      );
    }

    switch (activeSection) {
      case 'skills':
        return (
          <div className="space-y-8">
            <header className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4">{language === 'ar' ? 'خريطة المهارات' : 'Skills Architecture'}</h1>
                <p className="text-system-muted">{language === 'ar' ? 'تمثيل مرئي للاعتماديات التقنية والخبرات.' : 'Visual representation of technical dependencies and expertise.'}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setEditingSkill({ mode: 'add' })}
                  className="flex items-center gap-1.5 px-4 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent font-mono text-xs rounded-xl hover:bg-system-accent hover:text-black transition-all"
                >
                  <Plus size={13} /> {language === 'ar' ? 'إضافة مهارة' : 'Add Skill'}
                </button>
              )}
            </header>

            {/* Skills list with edit/delete buttons in admin mode */}
            {isAdmin && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {skills.map(skill => (
                  <div key={skill.id} className="relative group p-3 bg-system-card border border-system-border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{skill.name}</p>
                      <p className="text-xs font-mono text-system-muted">{skill.category} · {skill.level}%</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditBtn onClick={() => setEditingSkill({ skill, mode: 'edit' })} label="✏" />
                      <EditBtn danger onClick={() => deleteSkill(skill.id)} label="✕" />
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-system-accent/20 rounded-b-xl" style={{ width: '100%' }}>
                      <div className="h-full bg-system-accent rounded-b-xl" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SkillsGraph skills={skills} language={language} />
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-8">
            <header className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4">{language === 'ar' ? 'الشهادات الموثقة' : 'Verified Certifications'}</h1>
                <p className="text-system-muted">{language === 'ar' ? 'سجل الإنجازات التقنية المعتمدة.' : 'Log of verified technical achievements.'}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setEditingCert({ mode: 'add' })}
                  className="flex items-center gap-1.5 px-4 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent font-mono text-xs rounded-xl hover:bg-system-accent hover:text-black transition-all"
                >
                  <Plus size={13} /> {language === 'ar' ? 'إضافة شهادة' : 'Add Cert'}
                </button>
              )}
            </header>
            <CertTimeline
              certifications={certifications}
              language={language}
              isAdmin={isAdmin}
              onEdit={(cert) => setEditingCert({ cert, mode: 'edit' })}
              onDelete={(id) => deleteCert(id)}
            />
          </div>
        );

      case 'contact':
      case 'terminal':
        return <TerminalCLI bio={bio} language={language} />;

      case 'experience':
        return (
          <ExperienceTimeline
            experiences={experiences}
            language={language}
            isAdmin={isAdmin}
            onEdit={exp => setEditingExperience({ exp, mode: 'edit' })}
            onDelete={deleteExperience}
            onAdd={() => setEditingExperience({ mode: 'add' })}
          />
        );

      case 'bio':
      default:
        return (
          <div className="space-y-12">
            <AdminWrapper onEdit={() => setEditingBio(true)}>
              <header className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  {/* Avatar Column */}
                  {bio.avatarUrl && (
                    <div 
                      className="shrink-0 relative group cursor-pointer"
                      onClick={() => setShowAvatarPopup(true)}
                    >
                      <div className="absolute inset-0 bg-system-accent/20 rounded-full blur-lg transition duration-500 group-hover:bg-system-accent/40 group-hover:scale-105" />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-system-border hover:border-system-accent transition-colors bg-system-card overflow-hidden">
                        <img 
                          src={bio.avatarUrl} 
                          alt="Profile Avatar" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 border border-system-border/50 rounded-full" />
                      </div>
                    </div>
                  )}

                  {/* Content Column */}
                  <div className="flex-1 space-y-6">
                    <div className="inline-block px-3 py-1 bg-system-accent/10 text-system-accent border border-system-accent/20 rounded font-mono text-xs uppercase tracking-widest">
                      {language === 'ar' ? 'متاح للعمل' : 'Available for hire'}
                    </div>

                    <h1 className="text-6xl font-bold tracking-tighter leading-none">
                      {language === 'ar' ? bio.nameAr : bio.nameEn}
                      <span className="block text-2xl mt-4 text-system-muted font-normal tracking-normal">
                        {language === 'ar' ? bio.titleAr : bio.titleEn}
                      </span>
                    </h1>

                    <p className="text-xl text-system-muted max-w-2xl leading-relaxed">
                      {language === 'ar' ? bio.descriptionAr : bio.descriptionEn}
                    </p>

                    <div className="flex gap-4">
                      {bio.whatsapp ? (
                        <a 
                          href={`https://wa.me/${bio.whatsapp.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-8 py-3 bg-system-accent text-black font-bold rounded hover:opacity-90 transition-opacity flex items-center justify-center"
                        >
                          {language === 'ar' ? 'تواصل معي' : 'Hire Me'}
                        </a>
                      ) : (
                        <button className="px-8 py-3 bg-system-accent text-black font-bold rounded hover:opacity-90 transition-opacity">
                          {language === 'ar' ? 'تواصل معي' : 'Hire Me'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setActiveSection('project-edas')}
                        className="px-8 py-3 border border-system-border hover:bg-system-border transition-colors rounded font-bold"
                      >
                        {language === 'ar' ? 'رؤية أعمالي' : 'See Work'}
                      </button>
                      <button
                        onClick={() => {
                          const originalTitle = document.title;
                          document.title = language === 'ar' ? `سي في ${bio.nameAr}` : `CV ${bio.nameEn}`;
                          window.print();
                          setTimeout(() => { document.title = originalTitle; }, 100);
                        }}
                        className="px-4 py-3 border border-system-border hover:text-system-accent hover:border-system-accent transition-colors rounded flex items-center justify-center group"
                        title={language === 'ar' ? 'تنزيل السيرة الذاتية (PDF)' : 'Download Resume (PDF)'}
                      >
                        <FileDown size={18} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </header>
            </AdminWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'BACKEND', descAr: 'بناء أنظمة ويب مؤسسية بـ Laravel مع معمارية نظيفة وصلاحيات دقيقة.', descEn: 'Enterprise web systems in Laravel with clean architecture & granular permissions.', techs: ['Laravel', 'PHP', 'MySQL'] },
                { num: '02', title: 'MOBILE', descAr: 'تطبيقات Flutter احترافية تعمل بدون إنترنت مع مزامنة ذكية.', descEn: 'Professional Flutter apps with offline-first architecture & intelligent sync.', techs: ['Flutter', 'Dart', 'Riverpod'] },
                { num: '03', title: 'FULLSTACK', descAr: 'ربط الويب والموبايل عبر REST APIs محكمة مع توثيق Sanctum.', descEn: 'Connecting web & mobile via robust REST APIs with Sanctum authentication.', techs: ['REST API', 'Sanctum', 'JSON'] },
              ].map(card => (
                <div key={card.num} className="p-6 bg-system-card border border-system-border rounded-xl space-y-3 hover:border-system-accent/40 transition-colors">
                  <h3 className="text-sm font-bold font-mono text-system-accent uppercase tracking-wider">{card.num}. {card.title}</h3>
                  <p className="text-system-muted text-sm leading-relaxed">{language === 'ar' ? card.descAr : card.descEn}</p>
                  <div className="flex gap-1 flex-wrap">
                    {card.techs.map(t => <span key={t} className="text-[10px] font-mono px-2 py-0.5 bg-system-border rounded text-system-muted">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats from bio context */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bio.stats.map((stat, i) => (
                <div key={i} className="p-4 bg-system-card/50 border border-system-border rounded-xl text-center space-y-1 hover:border-system-accent/30 transition-colors">
                  <div className="text-3xl font-bold font-mono text-system-accent">
                    {language === 'ar' ? stat.numAr : stat.numEn}
                  </div>
                  <div className="text-xs font-mono text-system-muted uppercase tracking-wide">
                    {language === 'ar' ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>

            {/* Projects quick add in admin mode */}
            {isAdmin && (
              <div className="p-4 border border-dashed border-system-accent/30 rounded-xl flex items-center justify-between">
                <p className="text-sm font-mono text-system-muted">
                  {language === 'ar' ? '➕ إضافة مشروع جديد' : '➕ Add new project'}
                </p>
                <button
                  onClick={() => setEditingProject({ mode: 'add' })}
                  className="flex items-center gap-2 px-4 py-2 bg-system-accent text-black font-bold font-mono text-xs rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} /> {language === 'ar' ? 'مشروع جديد' : 'New Project'}
                </button>
              </div>
            )}

            {/* GitHub Live Stats Widget */}
            {bio.github && (
              <GitHubStats username={bio.github} language={language} />
            )}
          </div>
        );
    }
  };

  return (
    <>
    <div id="main-app" className="h-screen flex flex-col overflow-hidden selection:bg-system-accent selection:text-black">
      {/* Top Bar */}
      <header className="h-12 border-b border-system-border bg-system-bg flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            <Terminal size={18} className="text-system-accent" />
            <span className="hidden sm:inline">ARCHITECT_CONSOLE_V1.1</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 hover:bg-system-border rounded transition-colors text-xs font-mono"
          >
            <Globe size={14} />
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <div className="h-4 w-px bg-system-border mx-2" />
          <div className="flex items-center gap-3 text-system-muted">
            {bio.github ? (
              <a href={bio.github} target="_blank" rel="noreferrer" title="GitHub" className="hover:text-system-accent transition-colors">
                <Github size={16} />
              </a>
            ) : (
              <Github size={16} className="opacity-30" />
            )}
            {bio.linkedin ? (
              <a href={bio.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-system-accent transition-colors">
                <Linkedin size={16} />
              </a>
            ) : (
              <Linkedin size={16} className="opacity-30" />
            )}
            {bio.email ? (
              <a href={`mailto:${bio.email}`} title="Email" className="hover:text-system-accent transition-colors">
                <Mail size={16} />
              </a>
            ) : (
              <Mail size={16} className="opacity-30" />
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Toggle (Mobile) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed bottom-16 right-6 z-[60] p-4 bg-system-accent text-black rounded-full shadow-lg shadow-system-accent/20 transition-transform active:scale-95"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 max-w-[80vw] h-full",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}>
          <FileTree
            activeSection={activeSection}
            onSectionChange={(s) => {
              setActiveSection(s);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            language={language}
            projects={projects}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative grid-lines">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection + language}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 border-t border-system-border bg-system-card flex items-center justify-between px-4 text-[10px] font-mono text-system-muted">
        <div className="flex items-center gap-4">
          {/* ⬇️ SECRET TRIGGER — click 5 times */}
          <div
            className="flex items-center gap-1 cursor-default select-none"
            onClick={handleSecretClick}
            title=""
          >
            <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse" />
            <span>SYSTEM_ONLINE</span>
          </div>
          <span className="hidden sm:inline">LOC: {activeSection.toUpperCase()}</span>
          {visitors > 0 && (
            <span className="hidden md:inline pl-4 border-l border-system-border">
              VISITORS: {visitors}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>TSX / TAILWIND</span>
          <span className="hidden sm:inline">LATENCY: 14ms</span>
          {isAdmin && (
            <span className="text-system-accent font-bold animate-pulse">◈ ADMIN</span>
          )}
        </div>
      </footer>

      {/* ─── Admin Modals ──────────────────────────────── */}
      <AnimatePresence>
        {showPasswordModal && !isAdmin && (
          <PasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdmin && (
          <AdminToolbar
            onEditBio={() => setEditingBio(true)}
            onNavigate={setActiveSection}
            activeSection={activeSection}
            language={language}
            onAddProject={() => setEditingProject({ mode: 'add' })}
            onAddCert={() => setEditingCert({ mode: 'add' })}
            onAddSkill={() => setEditingSkill({ mode: 'add' })}
            onAddExperience={() => setEditingExperience({ mode: 'add' })}
          />
        )}
      </AnimatePresence>

      {editingProject && (
        <EditProjectModal
          project={editingProject.project}
          mode={editingProject.mode}
          onClose={() => setEditingProject(null)}
        />
      )}

      {editingCert && (
        <EditCertModal
          cert={editingCert.cert}
          mode={editingCert.mode}
          onClose={() => setEditingCert(null)}
        />
      )}

      {editingSkill && (
        <EditSkillModal
          skill={editingSkill.skill}
          mode={editingSkill.mode}
          onClose={() => setEditingSkill(null)}
          allSkillIds={skills.map(s => s.id)}
        />
      )}

      {editingBio && (
        <EditBioModal
          bio={bio}
          onClose={() => setEditingBio(false)}
        />
      )}

      {editingExperience && (
        <EditExperienceModal
          experience={editingExperience.exp}
          mode={editingExperience.mode}
          onClose={() => setEditingExperience(null)}
        />
      )}

    </div>

      {/* Avatar Popup */}
      <AnimatePresence>
        {showAvatarPopup && bio.avatarUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowAvatarPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm aspect-square md:max-w-md rounded-full overflow-hidden border-4 border-system-accent shadow-[0_0_50px_rgba(0,255,128,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={bio.avatarUrl} 
                alt="Popup Avatar" 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setShowAvatarPopup(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-system-accent hover:text-black text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Print View */}
      <ResumePrintView
        bio={bio}
        projects={projects}
        skills={skills}
        certifications={certifications}
        experiences={experiences}
        language={language}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT EXPORT — wraps with AdminProvider
// ═══════════════════════════════════════════════════════
export default function App() {
  return (
    <AdminProvider>
      <AppInner />
    </AdminProvider>
  );
}
