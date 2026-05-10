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
  const isISO = /^\d{4}-\d{2}/.test(trim) || /^\d{4}$/.test(trim);
  if (isISO) {
    const d = new Date(trim.length === 7 ? trim + '-01' : trim);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric', month: 'short',
      });
    }
  }
  return trim;
}
