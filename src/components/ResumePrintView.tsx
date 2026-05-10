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

import { formatDate } from '../lib/utils';

function range(s: string, e: string, lang: Language) {
  const sf = formatDate(s, lang);
  const ef = formatDate(e, lang);
  if (sf && ef) return `${sf} – ${ef}`;
  return sf || ef;
}

const CAT: Record<string, { ar: string; en: string }> = {
  backend:      { ar: 'الخلفية',        en: 'Backend'       },
  mobile:       { ar: 'الموبايل',       en: 'Mobile'        },
  frontend:     { ar: 'الأمامية',       en: 'Frontend'      },
  architecture: { ar: 'المعمارية',      en: 'Architecture'  },
  devops:       { ar: 'DevOps',         en: 'DevOps'        },
};
const CAT_ORDER = ['backend', 'mobile', 'frontend', 'architecture', 'devops'];

// Shared colours
const K  = '#000';
const D  = '#1a1a1a';
const M  = '#404040';
const G  = '#666';
const F  = "Arial,'Helvetica Neue','Noto Sans Arabic',sans-serif";

function H2({ label }: { label: string }) {
  return (
    <div style={{ borderBottom: '1.5pt solid #000', paddingBottom: '1pt', marginBottom: '3pt', marginTop: '7pt' }}>
      <h2 style={{ margin: 0, fontSize: '8.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.09em', color: K, lineHeight: 1.2 }}>
        {label}
      </h2>
    </div>
  );
}

export default function ResumePrintView({ bio, projects, skills, certifications, experiences, language }: ResumePrintViewProps) {
  const ar = language === 'ar';
  const name    = ar ? bio.nameAr    : bio.nameEn;
  const title   = ar ? bio.titleAr   : bio.titleEn;
  const summary = ar ? bio.descriptionAr : bio.descriptionEn;

  // Use experiences exactly as ordered in the admin panel (so Programming comes first if configured that way)
  const exps = experiences;

  const certs = [...certifications].sort((a, b) => b.date.localeCompare(a.date));

  const skillGroups = CAT_ORDER
    .map(c => ({ cat: c, label: ar ? CAT[c].ar : CAT[c].en, items: skills.filter(s => s.category === c).map(s => s.name) }))
    .filter(g => g.items.length);

  const contactParts = [
    bio.email,
    bio.whatsapp,
    bio.linkedin?.replace('https://www.','').replace('https://',''),
    bio.github?.replace('https://www.','').replace('https://',''),
  ].filter(Boolean);

  // Truncate long descriptions for single-page constraint
  const trunc = (text: string, maxChars = 180) =>
    text && text.length > maxChars ? text.slice(0, maxChars).trimEnd() + '…' : text;

  const page: React.CSSProperties = {
    fontFamily: F, fontSize: '9pt', lineHeight: '1.38', color: D,
    background: '#fff', width: '210mm', margin: 0, padding: 0,
  };

  return (
    <div className="hidden print:block" dir={ar ? 'rtl' : 'ltr'} style={page}>
      <div style={{ padding: '11mm 15mm 10mm 15mm' }}>

        {/* ── HEADER ──────────────────────────────────── */}
        <div style={{ borderBottom: '2pt solid #000', paddingBottom: '6pt', marginBottom: '0' }}>
          <h1 style={{ margin: '0 0 1.5pt 0', fontSize: '19pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.035em', color: K, lineHeight: 1.1 }}>
            {name}
          </h1>
          <p style={{ margin: '0 0 5pt 0', fontSize: '10pt', fontWeight: 600, color: M, letterSpacing: '0.01em' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '8pt', color: G, lineHeight: 1.5 }}>
            {contactParts.join('   |   ')}
          </p>
        </div>

        {/* ── SUMMARY ─────────────────────────────────── */}
        {summary && (
          <>
            <H2 label={ar ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'} />
            <p style={{ margin: 0, fontSize: '9pt', color: M, lineHeight: '1.45', textAlign: 'justify' }}>
              {trunc(summary, 300)}
            </p>
          </>
        )}

        {/* ── EXPERIENCE ──────────────────────────────── */}
        {exps.length > 0 && (
          <>
            <H2 label={ar ? 'الخبرة المهنية' : 'PROFESSIONAL EXPERIENCE'} />
            {exps.slice(0, 4).map((exp, i) => (
              <div key={exp.id} style={{ marginTop: i === 0 ? '2pt' : '6pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup><col style={{ width: '68%' }} /><col style={{ width: '32%' }} /></colgroup>
                  <tbody><tr>
                    <td style={{ padding: 0, verticalAlign: 'top' }}>
                      <strong style={{ fontSize: '9.5pt', color: K }}>{ar ? exp.role.ar : exp.role.en}</strong>
                    </td>
                    <td style={{ padding: 0, textAlign: ar ? 'left' : 'right', fontSize: '8pt', color: G, fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }} dir="ltr">
                      {range(exp.startDate, exp.endDate, language)}
                    </td>
                  </tr></tbody>
                </table>
                <p style={{ margin: '1pt 0 2pt', fontSize: '8.5pt', fontWeight: 600, color: M }}>
                  {ar ? exp.company.ar : exp.company.en}
                </p>
                {(exp.description.ar || exp.description.en) && (
                  <p style={{ margin: '0 0 2pt', fontSize: '8.5pt', color: M, lineHeight: '1.42' }}>
                    {trunc(ar ? exp.description.ar : exp.description.en, 200)}
                  </p>
                )}
                {exp.technologies.length > 0 && (
                  <p style={{ margin: 0, fontSize: '8pt', color: G }}>
                    <strong style={{ color: D }}>{ar ? 'التقنيات: ' : 'Tech: '}</strong>
                    {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── TECHNICAL SKILLS ────────────────────────── */}
        {skillGroups.length > 0 && (
          <>
            <H2 label={ar ? 'المهارات التقنية' : 'TECHNICAL SKILLS'} />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2pt' }}>
              <tbody>
                {skillGroups.map(g => (
                  <tr key={g.cat}>
                    <td style={{ fontWeight: 700, fontSize: '8.5pt', color: K, paddingBottom: '2.5pt', paddingInlineEnd: '8pt', width: '85pt', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                      {g.label}:
                    </td>
                    <td style={{ fontSize: '8.5pt', color: M, paddingBottom: '2.5pt', verticalAlign: 'top' }}>
                      {g.items.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── KEY PROJECTS ─────────────────────────────── */}
        {projects.length > 0 && (
          <>
            <H2 label={ar ? 'المشاريع البارزة' : 'KEY PROJECTS'} />
            {projects.slice(0, 3).map((p, i) => (
              <div key={p.id} style={{ marginTop: i === 0 ? '2pt' : '5pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup><col style={{ width: '65%' }} /><col style={{ width: '35%' }} /></colgroup>
                  <tbody><tr>
                    <td style={{ padding: 0, verticalAlign: 'top' }}>
                      <strong style={{ fontSize: '9pt', color: K }}>{ar ? p.title.ar : p.title.en}</strong>
                      <span style={{ fontSize: '7.5pt', color: G, marginInlineStart: '5pt', fontWeight: 600 }}>
                        [{p.status === 'production' ? (ar ? 'إنتاج' : 'Production') : p.status === 'completed' ? (ar ? 'مكتمل' : 'Completed') : (ar ? 'تطوير' : 'Dev')}]
                      </span>
                    </td>
                    <td style={{ padding: 0, textAlign: ar ? 'left' : 'right', fontSize: '7.5pt', color: G, verticalAlign: 'top' }}>
                      {p.githubUrl?.replace('https://github.com/', 'github.com/')}
                    </td>
                  </tr></tbody>
                </table>
                <p style={{ margin: '1.5pt 0 1pt', fontSize: '8.5pt', color: M, lineHeight: '1.4' }}>
                  {trunc(ar ? p.description.ar : p.description.en, 160)}
                </p>
                <p style={{ margin: 0, fontSize: '8pt', color: G }}>
                  <strong style={{ color: D }}>{ar ? 'المكدس: ' : 'Stack: '}</strong>
                  {p.techStack.join(' · ')}
                </p>
              </div>
            ))}
          </>
        )}

        {/* ── CERTIFICATIONS ───────────────────────────── */}
        {certs.length > 0 && (
          <>
            <H2 label={ar ? 'الشهادات المهنية' : 'CERTIFICATIONS'} />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2pt' }}>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} style={{ verticalAlign: 'top' }}>
                    <td style={{ paddingBottom: '3pt', paddingInlineEnd: '8pt', verticalAlign: 'top' }}>
                      <strong style={{ fontSize: '8.5pt', color: K }}>{ar ? c.title.ar : c.title.en}</strong>
                      <span style={{ fontSize: '8pt', color: G, marginInlineStart: '5pt' }}>
                        — {c.issuer}{c.credentialId ? ` · ${c.credentialId}` : ''}
                      </span>
                    </td>
                    <td style={{ paddingBottom: '3pt', textAlign: ar ? 'left' : 'right', whiteSpace: 'nowrap', fontSize: '8pt', color: G, fontWeight: 600, width: '65pt', verticalAlign: 'top' }} dir="ltr">
                      {formatDate(c.date, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

      </div>
    </div>
  );
}
