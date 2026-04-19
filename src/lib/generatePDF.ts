import jsPDF from 'jspdf';
import { BioData } from '../context/AdminContext';
import { Project, Skill, Certification, Experience } from '../data/portfolio';

interface ResumeData {
  bio: BioData;
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  experiences: Experience[];
  language: 'ar' | 'en';
}

function formatDate(dateStr: string, lang: 'ar' | 'en') {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present') return lang === 'ar' ? 'حتى الآن' : 'Present';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

export async function generatePDF(data: ResumeData) {
  const { bio, projects, skills, certifications, experiences, language: lang } = data;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isRTL = lang === 'ar';
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // --- Color Palette (Cyber Theme) ---
  const BLACK   = [12, 12, 12] as [number, number, number];
  const ACCENT  = [0, 255, 128] as [number, number, number]; // system-accent
  const MUTED   = [120, 130, 130] as [number, number, number];
  const BORDER  = [40, 48, 48] as [number, number, number];
  const WHITE   = [220, 230, 225] as [number, number, number];

  let y = 0;

  // ── Background ──────────────────────────────────────────
  pdf.setFillColor(...BLACK);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // ── Accent top bar ──────────────────────────────────────
  pdf.setFillColor(...ACCENT);
  pdf.rect(0, 0, pageW, 1.5, 'F');

  // ── Header Section ──────────────────────────────────────
  y = 18;
  // Avatar placeholder (solid square if avatar not embeddable in PDF)
  const avatarSize = 22;
  const avatarX = isRTL ? pageW - margin - avatarSize : margin;
  pdf.setFillColor(...BORDER);
  pdf.roundedRect(avatarX, y - 2, avatarSize, avatarSize, 3, 3, 'F');
  pdf.setDrawColor(...ACCENT);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(avatarX, y - 2, avatarSize, avatarSize, 3, 3, 'S');
  // Initials inside avatar
  pdf.setFontSize(9);
  pdf.setTextColor(...ACCENT);
  const initials = (bio.nameEn || 'HM').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  pdf.text(initials, avatarX + avatarSize / 2, y + avatarSize / 2 - 3, { align: 'center' });

  const nameX = isRTL ? pageW - margin - avatarSize - 6 : margin + avatarSize + 6;
  const nameAlign = isRTL ? 'right' : 'left';

  // Name
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...WHITE);
  pdf.text(lang === 'ar' ? bio.nameAr : bio.nameEn, nameX, y + 5, { align: nameAlign });

  // Title
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...MUTED);
  pdf.text(lang === 'ar' ? bio.titleAr : bio.titleEn, nameX, y + 11, { align: nameAlign });

  // Contact row
  y += 18;
  pdf.setFontSize(8);
  let contactParts: string[] = [];
  if (bio.email)    contactParts.push(bio.email);
  if (bio.whatsapp) contactParts.push(bio.whatsapp);
  if (bio.github)   contactParts.push(bio.github.replace('https://', ''));
  if (bio.linkedin) contactParts.push(bio.linkedin.replace('https://', ''));
  if (contactParts.length) {
    pdf.setTextColor(...ACCENT);
    pdf.text(contactParts.join('  ·  '), isRTL ? pageW - margin - avatarSize - 6 : margin + avatarSize + 6, y, { align: nameAlign });
  }

  // Separator line
  y += 6;
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);

  // ── Description ─────────────────────────────────────────
  y += 7;
  const desc = lang === 'ar' ? bio.descriptionAr : bio.descriptionEn;
  if (desc) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(...MUTED);
    const lines = pdf.splitTextToSize(desc, contentW);
    pdf.text(lines, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += lines.length * 4.5 + 4;
  }

  // ── Section Helper ──────────────────────────────────────
  const drawSection = (title: string) => {
    y += 2;
    pdf.setFillColor(...ACCENT);
    pdf.rect(isRTL ? pageW - margin - 3 : margin, y, 3, 4, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...ACCENT);
    pdf.text(title.toUpperCase(), isRTL ? pageW - margin - 7 : margin + 7, y + 3, { align: isRTL ? 'right' : 'left' });
    y += 7;
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      pdf.setFillColor(...BLACK);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.setFillColor(...ACCENT);
      pdf.rect(0, 0, pageW, 1.5, 'F');
      y = margin;
    }
  };

  // ── Experience ──────────────────────────────────────────
  if (experiences.length > 0) {
    checkPage(30);
    drawSection(lang === 'ar' ? 'الخبرات المهنية' : 'Work Experience');
    experiences.forEach(exp => {
      checkPage(22);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text(lang === 'ar' ? exp.role.ar : exp.role.en, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
      const dateStr = `${formatDate(exp.startDate, lang)} — ${formatDate(exp.endDate, lang)}`;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...MUTED);
      pdf.text(dateStr, isRTL ? margin : pageW - margin, y, { align: isRTL ? 'left' : 'right' });
      y += 4;
      pdf.setTextColor(...ACCENT);
      pdf.text(lang === 'ar' ? exp.company.ar : exp.company.en, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
      y += 4;
      if (exp.description.ar || exp.description.en) {
        pdf.setFontSize(8.5);
        pdf.setTextColor(...MUTED);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(lang === 'ar' ? exp.description.ar : exp.description.en, contentW);
        pdf.text(lines, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += lines.length * 4 + 2;
      }
      if (exp.technologies?.length) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(...BORDER[0] > 100 ? ACCENT : MUTED);
        pdf.text(exp.technologies.join('  ·  '), isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 4;
      }
      y += 3;
    });
  }

  // ── Projects ─────────────────────────────────────────────
  checkPage(30);
  drawSection(lang === 'ar' ? 'المشاريع' : 'Projects');
  projects.slice(0, 5).forEach(proj => {
    checkPage(22);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text(lang === 'ar' ? proj.title.ar : proj.title.en, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += 4;
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...MUTED);
    const desc2 = lang === 'ar' ? proj.description.ar : proj.description.en;
    const lines2 = pdf.splitTextToSize(desc2, contentW);
    pdf.text(lines2.slice(0, 2), isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += Math.min(2, lines2.length) * 4 + 1;
    pdf.setFontSize(7.5);
    pdf.setTextColor(...ACCENT);
    pdf.text(proj.techStack.join('  ·  '), isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += 6;
  });

  // ── Skills ───────────────────────────────────────────────
  checkPage(30);
  drawSection(lang === 'ar' ? 'المهارات التقنية' : 'Technical Skills');
  const categories = [...new Set(skills.map(s => s.category))];
  categories.forEach(cat => {
    checkPage(15);
    const catSkills = skills.filter(s => s.category === cat);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...ACCENT);
    pdf.text(cat.toUpperCase(), isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...MUTED);
    pdf.text(catSkills.map(s => `${s.name} (${s.level}%)`).join('  ·  '), isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
    y += 6;
  });

  // ── Certifications ───────────────────────────────────────
  if (certifications.length > 0) {
    checkPage(30);
    drawSection(lang === 'ar' ? 'الشهادات' : 'Certifications');
    certifications.forEach(cert => {
      checkPage(14);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...WHITE);
      pdf.text(lang === 'ar' ? cert.title.ar : cert.title.en, isRTL ? pageW - margin : margin, y, { align: isRTL ? 'right' : 'left' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...MUTED);
      pdf.text(`${cert.issuer}  —  ${cert.date}`, isRTL ? margin : pageW - margin, y, { align: isRTL ? 'left' : 'right' });
      y += 7;
    });
  }

  // ── Footer ───────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(...ACCENT);
    pdf.rect(0, pageH - 1.5, pageW, 1.5, 'F');
    pdf.setFontSize(7);
    pdf.setTextColor(...MUTED);
    pdf.text(`${lang === 'ar' ? 'صُنع بـ' : 'Made with'} Architect Console  ·  ${i}/${totalPages}`, pageW / 2, pageH - 5, { align: 'center' });
  }

  const name = (lang === 'ar' ? bio.nameAr : bio.nameEn).replace(/\s+/g, '_');
  pdf.save(`${name}_Resume.pdf`);
}
