import { useState } from 'react';
import { Certification, Language } from '@/src/data/portfolio';
import { CheckCircle2, ExternalLink, Eye, X, Award, Hash, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CertTimelineProps {
  certifications: Certification[];
  language: Language;
  isAdmin?: boolean;
  onEdit?: (cert: Certification) => void;
  onDelete?: (id: string) => void;
}

// Modal معاينة الشهادة
function CertPreviewModal({ cert, language, onClose }: { cert: Certification; language: Language; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Certificate Card */}
          <div className="relative overflow-hidden rounded-2xl border border-system-accent/30 bg-system-card shadow-2xl shadow-system-accent/10">
            {/* Decorative Top Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-system-accent/0 via-system-accent to-system-accent/0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-system-border">
              <div className="flex items-center gap-2 font-mono text-xs text-system-muted uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-system-accent animate-pulse" />
                <span>{language === 'ar' ? 'معاينة الشهادة' : 'Certificate Preview'}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-system-border transition-colors text-system-muted hover:text-system-text"
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-8 space-y-6">
              {/* Certificate Design */}
              <div className="relative rounded-xl border border-system-accent/20 bg-gradient-to-br from-system-bg via-system-card to-system-bg p-8 text-center space-y-4 overflow-hidden">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-system-accent/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-system-accent/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-system-accent/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-system-accent/40 rounded-br-xl" />

                {/* Watermark Pattern */}
                <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none flex items-center justify-center">
                  <span className="text-[120px] font-mono font-black text-system-accent rotate-[-30deg]">CERT</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-system-accent/10 border border-system-accent/30">
                    <Award size={40} className="text-system-accent" />
                  </div>
                </div>

                {/* Issuer */}
                <div className="font-mono text-sm text-system-accent uppercase tracking-widest">
                  {cert.issuer}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-system-accent/20" />
                  <span className="text-system-accent/40 font-mono text-xs">✦</span>
                  <div className="h-px flex-1 bg-system-accent/20" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-system-text leading-tight">
                  {cert.title[language]}
                </h2>

                {/* Recipient */}
                <p className="text-system-muted text-sm font-mono">
                  {language === 'ar' ? 'ممنوح إلى: حمزة محمد' : 'Awarded to: Hamza Mohamed'}
                </p>

                {/* Tech Badge */}
                <div className="flex justify-center">
                  <span className="px-4 py-1.5 bg-system-accent/10 text-system-accent text-xs font-mono rounded-full border border-system-accent/30 uppercase tracking-wider">
                    {cert.tech}
                  </span>
                </div>

                {/* Date + Credential ID */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-xs font-mono text-system-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-60">{language === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                    <span className="text-system-text">{cert.date}</span>
                  </div>
                  {cert.credentialId && (
                    <>
                      <span className="hidden sm:block opacity-30">|</span>
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} className="opacity-60" />
                        <span className="text-system-text">{cert.credentialId}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Checkmark */}
                <div className="flex items-center justify-center gap-2 text-system-accent">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    {language === 'ar' ? 'شهادة موثقة' : 'Verified Certificate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-system-border">
              <span className="text-xs font-mono text-system-muted">
                {language === 'ar' ? 'اضغط خارج للإغلاق' : 'Click outside to close'}
              </span>
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-system-accent text-black text-xs font-bold font-mono rounded-lg hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={13} />
                {language === 'ar' ? 'التحقق من الشهادة' : 'Verify Certificate'}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CertTimeline({ certifications, language, isAdmin, onEdit, onDelete }: CertTimelineProps) {
  const [previewCert, setPreviewCert] = useState<Certification | null>(null);

  const techColors: Record<string, string> = {
    'Laravel': 'text-red-400 border-red-400/30 bg-red-400/10',
    'Flutter': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    'MySQL': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    'Architecture': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  };

  const techColor = (tech: string) => techColors[tech] || 'text-system-accent border-system-accent/30 bg-system-accent/10';

  return (
    <>
      {/* Preview Modal */}
      {previewCert && (
        <CertPreviewModal
          cert={previewCert}
          language={language}
          onClose={() => setPreviewCert(null)}
        />
      )}

      <div className="space-y-8 py-4">
        <div className="flex items-center gap-4 text-system-muted font-mono text-xs uppercase tracking-widest mb-8">
          <div className="h-px flex-1 bg-system-border"></div>
          <span>{language === 'ar' ? 'سجل الشهادات الموثقة' : 'Verified Certification Log'}</span>
          <div className="h-px flex-1 bg-system-border"></div>
        </div>

        <div className="relative space-y-0">
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-system-border"></div>

          {certifications.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 pb-10 group"
            >
              {/* Timeline Node */}
              <div className="absolute left-0 top-1 p-1 bg-system-bg border border-system-border rounded-full z-10 group-hover:border-system-accent transition-colors duration-300">
                <CheckCircle2 size={20} className="text-system-accent" />
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-system-muted mb-3">
                <span>{cert.date}</span>
                <span className={`px-2 py-0.5 rounded border ${techColor(cert.tech)}`}>
                  {cert.tech}
                </span>
                {cert.credentialId && (
                  <span className="opacity-50 flex items-center gap-1">
                    <Hash size={10} /> {cert.credentialId}
                  </span>
                )}
              </div>

              {/* Card */}
              <div className="p-5 bg-system-card/50 border border-system-border rounded-xl group-hover:border-system-accent/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-system-accent/5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Info */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-bold group-hover:text-system-accent transition-colors duration-300">
                      {cert.title[language]}
                    </h3>
                    <p className="text-system-muted text-sm font-mono">{cert.issuer}</p>
                  </div>

                   {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewCert(cert)}
                      className="flex items-center gap-2 px-4 py-2 bg-system-accent/10 border border-system-accent/30 text-system-accent text-xs font-bold font-mono rounded-lg hover:bg-system-accent hover:text-black transition-all duration-200 group/btn"
                    >
                      <Eye size={13} className="group-hover/btn:scale-110 transition-transform" />
                      {language === 'ar' ? 'معاينة' : 'Preview'}
                    </button>

                    {/* Verify External Link */}
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-system-border rounded-lg transition-colors text-system-muted hover:text-system-accent"
                      title={language === 'ar' ? 'التحقق الخارجي' : 'External Verification'}
                    >
                      <ExternalLink size={15} />
                    </a>

                    {/* Admin Buttons */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit?.(cert)}
                          className="p-2 hover:bg-system-accent/10 rounded-lg transition-colors text-system-muted hover:text-system-accent"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm('حذف الشهادة؟')) onDelete?.(cert.id); }}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-system-muted hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
