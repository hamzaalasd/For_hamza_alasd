import { Folder, FileCode, ChevronRight, ChevronDown, User, Briefcase, Award, Mail, Info, Globe, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Project } from '@/src/data/portfolio';
import SmartMarquee from './SmartMarquee';

interface FileTreeProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  language: 'ar' | 'en';
  projects?: Project[];
}

export default function FileTree({ activeSection, onSectionChange, language, projects = [] }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    root: true,
    projects: true,
    about: true,
    web_projects: true,
    mobile_projects: true,
  });

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const labels = {
    root: language === 'ar' ? 'النظام' : 'System',
    projects: language === 'ar' ? 'المشاريع' : 'Projects',
    web_projects: language === 'ar' ? 'مشاريع الويب' : 'Web Projects',
    mobile_projects: language === 'ar' ? 'مشاريع الموبايل' : 'Mobile Projects',
    about: language === 'ar' ? 'عني' : 'About',
    skills: language === 'ar' ? 'المهارات' : 'Skills',
    certs: language === 'ar' ? 'الشهادات' : 'Certifications',
    experience: language === 'ar' ? 'خبراتي' : 'Experience',
    contact: language === 'ar' ? 'اتصل بي' : 'Contact',
    // Web projects
    edas: 'EDAS',
    survey: language === 'ar' ? 'منصة الاستبيانات' : 'Survey System',
    // Mobile projects
    muzaraii: language === 'ar' ? 'مزارعي' : 'Muzaraii',
    edasApp: language === 'ar' ? 'EDAS للموظفين' : 'EDAS Employee',
    farmerOffline: language === 'ar' ? 'المسح الزراعي' : 'Farm Survey',
  };

  const TreeItem = ({ id, label, icon: Icon, isFile = false, sectionId, indent = false }: any) => {
    const isActive = activeSection === (sectionId || id);
    return (
      <div className="select-none">
        <div
          onClick={() => isFile ? onSectionChange(sectionId || id) : toggle(id)}
          title={label}
          className={cn(
            "flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-system-border/50 transition-colors group",
            isActive && "bg-system-accent/10 text-system-accent border-r-2 border-system-accent",
            indent && "pl-4"
          )}
        >
          {!isFile && (
            expanded[id] ? <ChevronDown size={14} className="text-system-muted shrink-0" /> : <ChevronRight size={14} className="text-system-muted shrink-0" />
          )}
          {isFile && <div className="w-3.5" />}
          <Icon size={16} className={cn("text-system-muted group-hover:text-system-accent transition-colors shrink-0", isActive && "text-system-accent")} />
          <SmartMarquee text={label} isActive={isActive} className="text-sm flex-1" />
        </div>
        {!isFile && expanded[id] && (
          <div className="ml-4 border-l border-system-border">
            {id === 'root' && (
              <>
                <TreeItem id="about" label={labels.about} icon={User} />
                <TreeItem id="projects" label={labels.projects} icon={Briefcase} />
                <TreeItem id="certs" label={labels.certs} icon={Award} isFile sectionId="certifications" />
                <TreeItem id="contact" label={labels.contact} icon={Mail} isFile sectionId="contact" />
              </>
            )}
            {id === 'projects' && (
              <>
                <TreeItem id="web_projects" label={labels.web_projects} icon={Globe} />
                <TreeItem id="mobile_projects" label={labels.mobile_projects} icon={Smartphone} />
              </>
            )}
            {id === 'web_projects' && (
              <>
                {projects.filter(p => p.type === 'web' || p.type === 'fullstack').map(p => (
                  <TreeItem key={p.id} id={`p_${p.id}`} label={language === 'ar' ? p.title.ar : p.title.en} icon={FileCode} isFile sectionId={`project-${p.slug}`} />
                ))}
                {projects.filter(p => p.type === 'web' || p.type === 'fullstack').length === 0 && (
                  <p className="px-4 py-1 text-xs font-mono text-system-muted/50">-- empty --</p>
                )}
              </>
            )}
            {id === 'mobile_projects' && (
              <>
                {projects.filter(p => p.type === 'mobile').map(p => (
                  <TreeItem key={p.id} id={`p_${p.id}`} label={language === 'ar' ? p.title.ar : p.title.en} icon={FileCode} isFile sectionId={`project-${p.slug}`} />
                ))}
                {projects.filter(p => p.type === 'mobile').length === 0 && (
                  <p className="px-4 py-1 text-xs font-mono text-system-muted/50">-- empty --</p>
                )}
              </>
            )}
            {id === 'about' && (
              <>
                <TreeItem id="skills" label={labels.skills} icon={Info} isFile sectionId="skills" />
                <TreeItem id="experience" label={labels.experience} icon={Briefcase} isFile sectionId="experience" />
                <TreeItem id="bio" label={labels.about} icon={Info} isFile sectionId="bio" />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-system-border h-full bg-system-bg/50 backdrop-blur-sm overflow-y-auto font-mono py-4">
      <div className="px-4 mb-4 text-[10px] uppercase tracking-widest text-system-muted font-bold">
        {language === 'ar' ? 'مستكشف النظام' : 'System Explorer'}
      </div>
      <TreeItem id="root" label={labels.root} icon={Folder} />
    </div>
  );
}
