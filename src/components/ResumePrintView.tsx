import { Mail, Phone, Globe, Github, Linkedin, MapPin } from 'lucide-react';
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

// Category label translation
function categoryLabel(cat: string, isRTL: boolean): string {
  const map: Record<string, { ar: string; en: string }> = {
    backend:      { ar: 'الواجهة الخلفية', en: 'Backend' },
    frontend:     { ar: 'الواجهة الأمامية', en: 'Frontend' },
    mobile:       { ar: 'تطبيقات الموبايل', en: 'Mobile' },
    devops:       { ar: 'البنية التحتية', en: 'DevOps & Infra' },
    architecture: { ar: 'معمارية الأنظمة', en: 'Architecture' },
  };
  return isRTL ? (map[cat]?.ar ?? cat) : (map[cat]?.en ?? cat);
}

export default function ResumePrintView({
  bio, projects, skills, certifications, experiences, language,
}: ResumePrintViewProps) {
  const isRTL = language === 'ar';
  const name    = isRTL ? bio.nameAr    : bio.nameEn;
  const title   = isRTL ? bio.titleAr   : bio.titleEn;
  const summary = isRTL ? bio.descriptionAr : bio.descriptionEn;

  // Group skills by category (ATS: plain text, comma-separated)
  const skillGroups = Array.from(new Set(skills.map(s => s.category))).map(cat => ({
    category: cat,
    label: categoryLabel(cat, isRTL),
    items: skills.filter(s => s.category === cat).map(s => s.name),
  }));

  return (
    <div
      className={`hidden print:block bg-white text-black w-full ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily: isRTL ? "'Noto Sans Arabic', Arial, sans-serif" : "Arial, 'Helvetica Neue', sans-serif" }}
    >
      {/*
       ┌─────────────────────────────────────────────────────────────────────┐
       │  ATS-OPTIMISED RESUME                                               │
       │  Rules applied:                                                     │
       │  • Plain HTML — no flex gaps / grid that confuse parsers            │
       │  • Single-column (except cert row)                                  │
       │  • No icons inside text lines (ATS can't parse SVG)                 │
       │  • Headings use standard uppercase labels                           │
       │  • Bullet points via ● character (safe for ATS)                     │
       │  • All URLs written as plain text                                   │
       │  • print-color-adjust: exact                                        │
       └─────────────────────────────────────────────────────────────────────┘
      */}
      <div style={{ maxWidth: '210mm', margin: '0 auto', padding: '18mm 20mm', color: '#111', fontSize: '10.5pt', lineHeight: '1.55' }}>

        {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '14pt', borderBottom: '2.5pt solid #111', paddingBottom: '10pt' }}>
          {/* Name */}
          <h1 style={{
            fontSize: '24pt',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            margin: '0 0 4pt 0',
            color: '#000',
            lineHeight: '1.15',
          }}>
            {name}
          </h1>

          {/* Title / Headline */}
          <p style={{ fontSize: '12pt', fontWeight: '600', color: '#333', margin: '0 0 8pt 0' }}>
            {title}
          </p>

          {/* Contact row — plain text, no SVG icons */}
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                {bio.email && (
                  <td style={{ paddingRight: '18pt', whiteSpace: 'nowrap', fontSize: '9.5pt', color: '#222', verticalAlign: 'middle' }}>
                    {isRTL ? 'البريد: ' : 'Email: '}<strong>{bio.email}</strong>
                  </td>
                )}
                {bio.whatsapp && (
                  <td style={{ paddingRight: '18pt', whiteSpace: 'nowrap', fontSize: '9.5pt', color: '#222', verticalAlign: 'middle' }} dir="ltr">
                    {isRTL ? 'الهاتف: ' : 'Phone: '}<strong>{bio.whatsapp}</strong>
                  </td>
                )}
                {bio.github && (
                  <td style={{ paddingRight: '18pt', whiteSpace: 'nowrap', fontSize: '9.5pt', color: '#222', verticalAlign: 'middle' }} dir="ltr">
                    GitHub: <strong>{bio.github.replace('https://', '').replace('www.', '')}</strong>
                  </td>
                )}
                {bio.linkedin && (
                  <td style={{ whiteSpace: 'nowrap', fontSize: '9.5pt', color: '#222', verticalAlign: 'middle' }} dir="ltr">
                    LinkedIn: <strong>{bio.linkedin.replace('https://', '').replace('www.', '')}</strong>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ═══ PROFESSIONAL SUMMARY ══════════════════════════════════════ */}
        {summary && (
          <section style={{ marginBottom: '14pt' }}>
            <SectionHeading isRTL={isRTL} ar="الملخص المهني" en="PROFESSIONAL SUMMARY" />
            <p style={{ margin: '4pt 0 0 0', color: '#222', textAlign: 'justify', fontSize: '10.5pt' }}>
              {summary}
            </p>
          </section>
        )}

        {/* ═══ PROFESSIONAL EXPERIENCE ═══════════════════════════════════ */}
        {experiences.length > 0 && (
          <section style={{ marginBottom: '14pt' }}>
            <SectionHeading isRTL={isRTL} ar="الخبرة المهنية" en="PROFESSIONAL EXPERIENCE" />
            {experiences.map((exp, idx) => (
              <div key={exp.id} style={{ marginBottom: idx < experiences.length - 1 ? '10pt' : '0', pageBreakInside: 'avoid' }}>
                {/* Role + Company + Date in one row */}
                <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '6pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '800', fontSize: '11pt', color: '#000' }}>
                          {isRTL ? exp.role.ar : exp.role.en}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '10pt', color: '#444', marginTop: '1pt' }}>
                          {isRTL ? exp.company.ar : exp.company.en}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'top', textAlign: isRTL ? 'left' : 'right', whiteSpace: 'nowrap', fontSize: '9.5pt', color: '#555', fontWeight: '600', paddingTop: '1pt' }}>
                        {formatDate(exp.startDate, language)} — {formatDate(exp.endDate, language)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Description */}
                {(exp.description.ar || exp.description.en) && (
                  <p style={{ margin: '4pt 0 2pt 0', color: '#333', fontSize: '10pt', lineHeight: '1.55' }}>
                    {isRTL ? exp.description.ar : exp.description.en}
                  </p>
                )}

                {/* Tech stack as ATS-readable plain text */}
                {exp.technologies.length > 0 && (
                  <p style={{ margin: '3pt 0 0 0', fontSize: '9.5pt', color: '#555' }}>
                    <strong>{isRTL ? 'التقنيات المستخدمة: ' : 'Technologies: '}</strong>
                    {exp.technologies.join(' | ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ═══ KEY PROJECTS ══════════════════════════════════════════════ */}
        {projects.length > 0 && (
          <section style={{ marginBottom: '14pt' }}>
            <SectionHeading isRTL={isRTL} ar="المشاريع البارزة" en="KEY PROJECTS" />
            {projects.slice(0, 4).map((proj, idx) => (
              <div key={proj.id} style={{ marginBottom: idx < Math.min(projects.length, 4) - 1 ? '9pt' : '0', pageBreakInside: 'avoid', marginTop: '6pt' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top' }}>
                        <span style={{ fontWeight: '800', fontSize: '10.5pt', color: '#000' }}>
                          {isRTL ? proj.title.ar : proj.title.en}
                        </span>
                        {proj.status && (
                          <span style={{ fontSize: '8.5pt', color: '#666', fontWeight: '600', marginInlineStart: '8pt' }}>
                            [{proj.status.toUpperCase()}]
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: isRTL ? 'left' : 'right', whiteSpace: 'nowrap', fontSize: '9pt', color: '#666', verticalAlign: 'top' }}>
                        {proj.demoUrl && <span>{proj.demoUrl.replace('https://', '')}</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ margin: '3pt 0 2pt 0', color: '#333', fontSize: '10pt', lineHeight: '1.5' }}>
                  {isRTL ? proj.description.ar : proj.description.en}
                </p>
                <p style={{ margin: '2pt 0 0 0', fontSize: '9.5pt', color: '#555' }}>
                  <strong>{isRTL ? 'التقنيات: ' : 'Stack: '}</strong>
                  {proj.techStack.join(' · ')}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ═══ TECHNICAL SKILLS ══════════════════════════════════════════ */}
        {skills.length > 0 && (
          <section style={{ marginBottom: '14pt', pageBreakInside: 'avoid' }}>
            <SectionHeading isRTL={isRTL} ar="المهارات التقنية" en="TECHNICAL SKILLS" />
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '5pt' }}>
              <tbody>
                {skillGroups.map(group => (
                  <tr key={group.category} style={{ verticalAlign: 'top' }}>
                    <td style={{
                      fontWeight: '700',
                      fontSize: '10pt',
                      color: '#111',
                      width: isRTL ? 'auto' : '130pt',
                      minWidth: '110pt',
                      paddingBottom: '4pt',
                      paddingInlineEnd: '10pt',
                      whiteSpace: 'nowrap',
                    }}>
                      {group.label}:
                    </td>
                    <td style={{ fontSize: '10pt', color: '#333', paddingBottom: '4pt' }}>
                      {group.items.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ═══ CERTIFICATIONS ════════════════════════════════════════════ */}
        {certifications.length > 0 && (
          <section style={{ marginBottom: '0', pageBreakInside: 'avoid' }}>
            <SectionHeading isRTL={isRTL} ar="الشهادات المهنية" en="CERTIFICATIONS" />
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '5pt' }}>
              <tbody>
                {certifications.map(cert => (
                  <tr key={cert.id} style={{ verticalAlign: 'top', pageBreakInside: 'avoid' }}>
                    <td style={{ paddingBottom: '5pt', paddingInlineEnd: '12pt' }}>
                      <div style={{ fontWeight: '700', fontSize: '10pt', color: '#000' }}>
                        {isRTL ? cert.title.ar : cert.title.en}
                      </div>
                      <div style={{ fontSize: '9.5pt', color: '#555', marginTop: '1pt' }}>
                        {cert.issuer}
                        {cert.credentialId && (
                          <span style={{ marginInlineStart: '8pt', color: '#777' }}>
                            · ID: {cert.credentialId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{
                      textAlign: isRTL ? 'left' : 'right',
                      whiteSpace: 'nowrap',
                      fontSize: '9.5pt',
                      color: '#555',
                      fontWeight: '600',
                      verticalAlign: 'top',
                      paddingBottom: '5pt',
                    }}>
                      {formatDate(cert.date, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ═══ FOOTER LINE ═══════════════════════════════════════════════ */}
        <div style={{ borderTop: '1pt solid #ccc', marginTop: '14pt', paddingTop: '6pt', textAlign: 'center', fontSize: '8.5pt', color: '#888' }}>
          {isRTL
            ? `${name} — ${bio.email ?? ''} — ${bio.whatsapp ?? ''} — ${new Date().getFullYear()}`
            : `${name} — ${bio.email ?? ''} — ${bio.whatsapp ?? ''} — ${new Date().getFullYear()}`
          }
        </div>

      </div>
    </div>
  );
}

// ─── Reusable ATS Section Heading ─────────────────────────────────────────────
function SectionHeading({ ar, en, isRTL }: { ar: string; en: string; isRTL: boolean }) {
  return (
    <div style={{
      borderBottom: '1.5pt solid #111',
      paddingBottom: '2pt',
      marginBottom: '2pt',
    }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#000',
        margin: '0',
      }}>
        {isRTL ? ar : en}
      </h2>
    </div>
  );
}
