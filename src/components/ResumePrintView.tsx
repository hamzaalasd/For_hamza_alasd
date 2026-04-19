import { Mail, Phone, MapPin, Globe, Github, Linkedin, Calendar, Briefcase 
} from 'lucide-react';
import { Project, Skill, Certification, Experience, Language } from '../data/portfolio';
import { BioData } from '../context/AdminContext';

interface ResumePrintViewProps {
  bio: BioData;
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  experiences: Experience[];
  language: Language;
}

function formatDate(dateStr: string, lang: Language) {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present') return lang === 'ar' ? 'حتى الآن' : 'Present';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

export default function ResumePrintView({ bio, projects, skills, certifications, experiences, language }: ResumePrintViewProps) {
  const isRTL = language === 'ar';
  
  return (
    <div 
      className={`hidden print:block absolute inset-0 z-[9999] bg-white w-full ${isRTL ? 'rtl font-sans' : 'ltr font-sans'} text-sm leading-relaxed`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="print:w-full print:max-w-none print:p-0 max-w-[210mm] mx-auto p-12 bg-white text-black">
        
        {/* Header: Name, Title, Contact */}
        <header className="border-b-2 border-gray-900 pb-6 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
            {isRTL ? bio.nameAr : bio.nameEn}
          </h1>
          <h2 className="text-xl text-gray-600 font-medium mb-4">
            {isRTL ? bio.titleAr : bio.titleEn}
          </h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-700 font-medium">
            {bio.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-gray-500" />
                <span>{bio.email}</span>
              </div>
            )}
            {bio.whatsapp && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-gray-500" />
                <span dir="ltr">{bio.whatsapp}</span>
              </div>
            )}
            {bio.github && (
              <div className="flex items-center gap-1.5">
                <Github size={12} className="text-gray-500" />
                <span dir="ltr">{bio.github.replace('https://', '').replace('www.', '')}</span>
              </div>
            )}
            {bio.linkedin && (
              <div className="flex items-center gap-1.5">
                <Linkedin size={12} className="text-gray-500" />
                <span dir="ltr">{bio.linkedin.replace('https://', '').replace('www.', '')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="mb-8">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap text-justify">
            {isRTL ? bio.descriptionAr : bio.descriptionEn}
          </p>
        </section>

        {/* Experience */}
        {experiences.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-4 flex items-center gap-2">
              <Briefcase size={16} />
              {isRTL ? 'الخبرات المهنية' : 'Professional Experience'}
            </h3>
            <div className="space-y-5">
              {experiences.map(exp => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-base">
                      {isRTL ? exp.role.ar : exp.role.en}
                    </h4>
                    <span className="text-xs text-gray-500 font-medium font-mono shrink-0">
                      {formatDate(exp.startDate, language)} — {formatDate(exp.endDate, language)}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium text-sm mb-2">
                    {isRTL ? exp.company.ar : exp.company.en}
                  </div>
                  {(exp.description.ar || exp.description.en) && (
                    <p className="text-gray-700 mb-2 leading-snug">
                      {isRTL ? exp.description.ar : exp.description.en}
                    </p>
                  )}
                  {exp.technologies.length > 0 && (
                    <p className="text-xs text-gray-500 font-sans mt-2 italic">
                      <span className="font-semibold not-italic">{isRTL ? 'التقنيات: ' : 'Tech: '}</span>
                      {exp.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-4 flex items-center gap-2">
              <Globe size={16} />
              {isRTL ? 'المشاريع البارزة' : 'Featured Projects'}
            </h3>
            <div className="space-y-5">
              {projects.slice(0, 5).map(proj => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900">
                      {isRTL ? proj.title.ar : proj.title.en}
                    </h4>
                    {/* Optionally display links */}
                    <div className="flex gap-2">
                      {proj.demoUrl && <span className="text-[10px] text-gray-400">Live Demo</span>}
                      {proj.githubUrl && <span className="text-[10px] text-gray-400">GitHub</span>}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-snug mb-2">
                    {isRTL ? proj.description.ar : proj.description.en}
                  </p>
                  <p className="text-xs text-gray-500 font-sans italic">
                    <span className="font-semibold not-italic">{isRTL ? 'التقنيات: ' : 'Tech: '}</span>
                    {proj.techStack.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-8 break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-4 flex items-center gap-2">
              <Code2Icon />
              {isRTL ? 'المهارات التقنية' : 'Technical Skills'}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {Array.from(new Set(skills.map(s => s.category))).map(cat => {
                const catSkills = skills.filter(s => s.category === cat);
                return (
                  <div key={cat} className="flex gap-2">
                    <span className="font-bold text-gray-900 text-sm min-w-[100px] uppercase">
                      {cat}:
                    </span>
                    <span className="text-gray-700 text-sm">
                      {catSkills.map(s => s.name).join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-4 flex items-center gap-2 break-after-avoid">
              <Calendar size={16} />
              {isRTL ? 'الشهادات' : 'Certifications'}
            </h3>
            <div className="space-y-3">
              {certifications.map(cert => (
                <div key={cert.id} className="flex justify-between items-baseline break-inside-avoid">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {isRTL ? cert.title.ar : cert.title.en}
                    </h4>
                    <span className="text-gray-600 text-xs">{cert.issuer}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Inline Icon to avoid extra imports
function Code2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  );
}
