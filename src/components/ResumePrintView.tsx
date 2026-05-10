/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ATS-OPTIMISED SINGLE-PAGE RESUME  — Expert Level               ║
 * ║                                                                  ║
 * ║  Rules applied:                                                  ║
 * ║  • ONE page — enforced via tight CSS + content limits           ║
 * ║  • Dates: "Jan 2024 – Present" (no ISO, no numbers-only)        ║
 * ║  • Reverse chronological within every section                   ║
 * ║  • ATS keywords embedded naturally in bullets                   ║
 * ║  • No SVG / icons inside parseable text lines                   ║
 * ║  • Table-based layout — ATS reads tables correctly              ║
 * ║  • Font: Arial — universally parseable                          ║
 * ║  • Inline styles only — guaranteed print fidelity               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

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

// ─── Date formatter — ATS best practice: "Jan 2024" not "2024-01-10" ──────────
function fmt(dateStr: string, lang: Language): string {
  if (!dateStr) return '';
  const lower = dateStr.toLowerCase();
  if (lower === 'present' || lower === 'حتى الآن') {
    return lang === 'ar' ? 'حتى الآن' : 'Present';
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',   // "Jan" / "يناير"
    });
  } catch {
    return dateStr;
  }
}

// ─── Date range — "Jan 2023 – Mar 2024" ───────────────────────────────────────
function dateRange(start: string, end: string, lang: Language): string {
  const s = fmt(start, lang);
  const e = fmt(end, lang);
  const sep = lang === 'ar' ? ' – ' : ' – ';
  return s && e ? `${s}${sep}${e}` : s || e;
}

// ─── Skill category labels ─────────────────────────────────────────────────────
const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  backend:      { ar: 'الواجهة الخلفية',   en: 'Backend'          },
  frontend:     { ar: 'الواجهة الأمامية',  en: 'Frontend'         },
  mobile:       { ar: 'الموبايل',          en: 'Mobile'           },
  devops:       { ar: 'البنية التحتية',    en: 'DevOps & Infra'   },
  architecture: { ar: 'معمارية الأنظمة',  en: 'Architecture'     },
};

// ─── Shared style constants ────────────────────────────────────────────────────
const FONT = "Arial, 'Helvetica Neue', 'Noto Sans Arabic', sans-serif";
const COLOR_BLACK  = '#000000';
const COLOR_DARK   = '#1a1a1a';
const COLOR_MID    = '#444444';
const COLOR_MUTED  = '#666666';
const COLOR_RULE   = '#000000';

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResumePrintView({
  bio, projects, skills, certifications, experiences, language,
}: ResumePrintViewProps) {
  const isRTL = language === 'ar';
  const name    = isRTL ? bio.nameAr    : bio.nameEn;
  const title   = isRTL ? bio.titleAr   : bio.titleEn;
  const summary = isRTL ? bio.descriptionAr : bio.descriptionEn;

  // Reverse-chronological sort for experience
  const sortedExp = [...experiences].sort((a, b) => {
    const aDate = a.endDate.toLowerCase() === 'present' ? '9999' : a.endDate;
    const bDate = b.endDate.toLowerCase() === 'present' ? '9999' : b.endDate;
    return bDate.localeCompare(aDate);
  });

  // Reverse-chronological sort for certs
  const sortedCerts = [...certifications].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  // Skill groups — ordered by importance for ATS
  const CAT_ORDER = ['backend', 'mobile', 'frontend', 'architecture', 'devops'];
  const skillGroups = CAT_ORDER
    .map(cat => ({
      cat,
      label: isRTL ? (CAT_LABELS[cat]?.ar ?? cat) : (CAT_LABELS[cat]?.en ?? cat),
      items: skills.filter(s => s.category === cat).map(s => s.name),
    }))
    .filter(g => g.items.length > 0);

  // Limit projects to top 3 (most impactful on one page)
  const topProjects = projects.slice(0, 3);

  // Page wrapper style
  const pageStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: '9.5pt',
    lineHeight: '1.42',
    color: COLOR_DARK,
    background: '#fff',
    margin: 0,
    padding: 0,
    width: '210mm',
  };

  const contentStyle: React.CSSProperties = {
    padding: '13mm 16mm 12mm 16mm',
  };

  return (
    <div
      className="hidden print:block"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={pageStyle}
    >
      <div style={contentStyle}>

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  HEADER                                                  ║
            ╚══════════════════════════════════════════════════════════╝ */}
        <div style={{ marginBottom: '9pt', borderBottom: `2pt solid ${COLOR_RULE}`, paddingBottom: '7pt' }}>

          {/* Name */}
          <h1 style={{
            fontSize: '20pt',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: COLOR_BLACK,
            margin: '0 0 2pt 0',
            lineHeight: 1.1,
          }}>
            {name}
          </h1>

          {/* Headline / Title — keyword-rich */}
          <p style={{
            fontSize: '10.5pt',
            fontWeight: 600,
            color: COLOR_MID,
            margin: '0 0 6pt 0',
            letterSpacing: '0.01em',
          }}>
            {title}
          </p>

          {/* Contact line — single row, no icons, plain text for ATS */}
          <p style={{ fontSize: '8.5pt', color: COLOR_MUTED, margin: 0, lineHeight: '1.6' }}>
            {[
              bio.email,
              bio.whatsapp,
              bio.linkedin ? bio.linkedin.replace('https://www.', '').replace('https://', '') : null,
              bio.github   ? bio.github.replace('https://www.', '').replace('https://', '')   : null,
            ].filter(Boolean).join('   |   ')}
          </p>
        </div>

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  PROFESSIONAL SUMMARY  — 2–3 lines max, ATS keywords   ║
            ╚══════════════════════════════════════════════════════════╝ */}
        {summary && (
          <Section label={isRTL ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'}>
            <p style={{ margin: 0, color: COLOR_MID, fontSize: '9.5pt', lineHeight: '1.5', textAlign: 'justify' }}>
              {summary}
            </p>
          </Section>
        )}

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  PROFESSIONAL EXPERIENCE — reverse chronological        ║
            ║  Dates: "MMM YYYY – MMM YYYY" or "MMM YYYY – Present"  ║
            ╚══════════════════════════════════════════════════════════╝ */}
        {sortedExp.length > 0 && (
          <Section label={isRTL ? 'الخبرة المهنية' : 'PROFESSIONAL EXPERIENCE'}>
            {sortedExp.map((exp, i) => (
              <div key={exp.id} style={{ marginTop: i === 0 ? '4pt' : '7pt' }}>
                {/* Role + Date row */}
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '70%' }} />
                    <col style={{ width: '30%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top', padding: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: '10pt', color: COLOR_BLACK }}>
                          {isRTL ? exp.role.ar : exp.role.en}
                        </span>
                      </td>
                      <td style={{
                        verticalAlign: 'top',
                        padding: 0,
                        textAlign: isRTL ? 'left' : 'right',
                        fontSize: '8.5pt',
                        color: COLOR_MUTED,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        {dateRange(exp.startDate, exp.endDate, language)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Company */}
                <p style={{ margin: '1pt 0 3pt 0', fontSize: '9pt', fontWeight: 600, color: COLOR_MID }}>
                  {isRTL ? exp.company.ar : exp.company.en}
                </p>
                {/* Description */}
                {(exp.description.ar || exp.description.en) && (
                  <p style={{ margin: '0 0 2pt 0', fontSize: '9pt', color: COLOR_MID, lineHeight: '1.5' }}>
                    {isRTL ? exp.description.ar : exp.description.en}
                  </p>
                )}
                {/* Tech — ATS parses inline keywords excellently */}
                {exp.technologies.length > 0 && (
                  <p style={{ margin: 0, fontSize: '8.5pt', color: COLOR_MUTED }}>
                    <strong style={{ color: COLOR_DARK }}>
                      {isRTL ? 'التقنيات: ' : 'Technologies: '}
                    </strong>
                    {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  TECHNICAL SKILLS — keyword-rich, grouped, ATS-ready   ║
            ╚══════════════════════════════════════════════════════════╝ */}
        {skillGroups.length > 0 && (
          <Section label={isRTL ? 'المهارات التقنية' : 'TECHNICAL SKILLS'}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4pt' }}>
              <tbody>
                {skillGroups.map(g => (
                  <tr key={g.cat}>
                    <td style={{
                      fontWeight: 700,
                      fontSize: '9pt',
                      color: COLOR_BLACK,
                      paddingBottom: '3pt',
                      paddingInlineEnd: '10pt',
                      width: isRTL ? 'auto' : '105pt',
                      minWidth: '85pt',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}>
                      {g.label}:
                    </td>
                    <td style={{
                      fontSize: '9pt',
                      color: COLOR_MID,
                      paddingBottom: '3pt',
                      verticalAlign: 'top',
                    }}>
                      {g.items.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  KEY PROJECTS — top 3, keyword-dense descriptions      ║
            ╚══════════════════════════════════════════════════════════╝ */}
        {topProjects.length > 0 && (
          <Section label={isRTL ? 'المشاريع البارزة' : 'KEY PROJECTS'}>
            {topProjects.map((proj, i) => (
              <div key={proj.id} style={{ marginTop: i === 0 ? '4pt' : '6pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '65%' }} />
                    <col style={{ width: '35%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 800, fontSize: '9.5pt', color: COLOR_BLACK }}>
                          {isRTL ? proj.title.ar : proj.title.en}
                        </span>
                        {proj.status && (
                          <span style={{ fontSize: '7.5pt', color: COLOR_MUTED, marginInlineStart: '6pt', fontWeight: 600 }}>
                            [{proj.status === 'production' ? (isRTL ? 'إنتاج' : 'Production') :
                               proj.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                               (isRTL ? 'تطوير' : 'In Dev')}]
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: 0,
                        verticalAlign: 'top',
                        textAlign: isRTL ? 'left' : 'right',
                        fontSize: '8pt',
                        color: COLOR_MUTED,
                        fontWeight: 500,
                      }}>
                        {proj.demoUrl && proj.demoUrl.replace('https://', '')}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ margin: '2pt 0 1.5pt 0', fontSize: '9pt', color: COLOR_MID, lineHeight: '1.45' }}>
                  {isRTL ? proj.description.ar : proj.description.en}
                </p>
                <p style={{ margin: 0, fontSize: '8.5pt', color: COLOR_MUTED }}>
                  <strong style={{ color: COLOR_DARK }}>
                    {isRTL ? 'المكدس: ' : 'Stack: '}
                  </strong>
                  {proj.techStack.join(' · ')}
                </p>
              </div>
            ))}
          </Section>
        )}

        {/* ╔══════════════════════════════════════════════════════════╗
            ║  CERTIFICATIONS — reverse chronological, compact        ║
            ╚══════════════════════════════════════════════════════════╝ */}
        {sortedCerts.length > 0 && (
          <Section label={isRTL ? 'الشهادات المهنية' : 'CERTIFICATIONS'}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4pt' }}>
              <tbody>
                {sortedCerts.map(cert => (
                  <tr key={cert.id} style={{ verticalAlign: 'top' }}>
                    {/* Cert name + issuer */}
                    <td style={{ paddingBottom: '4pt', paddingInlineEnd: '10pt', verticalAlign: 'top' }}>
                      <span style={{ fontWeight: 700, fontSize: '9pt', color: COLOR_BLACK }}>
                        {isRTL ? cert.title.ar : cert.title.en}
                      </span>
                      <span style={{ fontSize: '8.5pt', color: COLOR_MUTED, marginInlineStart: '6pt' }}>
                        — {cert.issuer}
                        {cert.credentialId ? ` · ${cert.credentialId}` : ''}
                      </span>
                    </td>
                    {/* Date — right-aligned */}
                    <td style={{
                      paddingBottom: '4pt',
                      textAlign: isRTL ? 'left' : 'right',
                      whiteSpace: 'nowrap',
                      fontSize: '8.5pt',
                      color: COLOR_MUTED,
                      fontWeight: 600,
                      verticalAlign: 'top',
                      width: '70pt',
                    }}>
                      {fmt(cert.date, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

      </div>
    </div>
  );
}

// ─── Section wrapper with bold uppercase heading + rule ───────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8pt' }}>
      {/* Section heading — ATS loves uppercase plain-text headings */}
      <div style={{
        borderBottom: '1.2pt solid #000',
        marginBottom: '3pt',
        paddingBottom: '1.5pt',
      }}>
        <h2 style={{
          fontSize: '9pt',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#000',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {label}
        </h2>
      </div>
      {children}
    </div>
  );
}
