import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(raw: string, lang: 'ar' | 'en'): string {
  if (!raw) return '';
  const trim = raw.trim();
  const lower = trim.toLowerCase();
  
  if (lower === 'present' || trim === 'حتى الآن' || trim === 'الآن') {
    return lang === 'ar' ? 'حتى الآن' : 'Present';
  }

  // Helper to get localized month-year
  const formatD = (d: Date) => {
    // ar-EG provides standard Gregorian Arabic months (يناير, فبراير...)
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  // 1. ISO: YYYY-MM or YYYY-MM-DD
  if (/^\d{4}-\d{2}/.test(trim) || /^\d{4}$/.test(trim)) {
    const d = new Date(trim.length === 7 ? trim + '-01' : trim);
    if (!isNaN(d.getTime())) return formatD(d);
  }

  // 2. DD-MM-YYYY or D-M-YYYY (e.g. 15-4-2026)
  const dmyMatch = trim.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    // Convert to ISO-like YYYY-MM-DD for standard parsing
    const d = new Date(`${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}T00:00:00`);
    if (!isNaN(d.getTime())) return formatD(d);
  }

  // 3. Try standard JS Date parsing (handles "May 2024", "June 2025")
  const standardDate = new Date(trim);
  if (!isNaN(standardDate.getTime())) {
    return formatD(standardDate);
  }

  // 4. Aggressive text translation fallback for unparsable strings (e.g. typos like 'Aprill 2024' or multiple dates)
  if (lang === 'ar') {
    let translated = trim;
    const EN_MONTHS: Record<string, string> = {
      'january': 'يناير', 'jan': 'يناير',
      'february': 'فبراير', 'feb': 'فبراير',
      'march': 'مارس', 'mar': 'مارس',
      'april': 'أبريل', 'apr': 'أبريل', 'aprill': 'أبريل', // typo fix
      'may': 'مايو',
      'june': 'يونيو', 'jun': 'يونيو',
      'july': 'يوليو', 'jul': 'يوليو',
      'august': 'أغسطس', 'aug': 'أغسطس',
      'september': 'سبتمبر', 'sep': 'سبتمبر', 'sept': 'سبتمبر',
      'october': 'أكتوبر', 'oct': 'أكتوبر',
      'november': 'نوفمبر', 'nov': 'نوفمبر',
      'december': 'ديسمبر', 'dec': 'ديسمبر'
    };
    
    // Replace English month names with Arabic
    for (const [en, ar] of Object.entries(EN_MONTHS)) {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, ar);
    }
    return translated;
  }

  return trim;
}
