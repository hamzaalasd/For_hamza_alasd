import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalBootProps {
  onComplete: () => void;
  language: 'ar' | 'en';
}

const bootLines = {
  en: [
    'Initializing system core...',
    'Loading architectural modules...',
    'Verifying security protocols...',
    'Mounting file system...',
    'Establishing neural link...',
    'System ready. Welcome, Architect Hamza.'
  ],
  ar: [
    'جاري تهيئة النواة...',
    'تحميل الوحدات المعمارية...',
    'التحقق من بروتوكولات الأمان...',
    'تثبيت نظام الملفات...',
    'إنشاء الرابط العصبي...',
    'النظام جاهز. أهلاً بك في بروفايل الخاص ب حمزة الاسد.'
  ]
};

export default function TerminalBoot({ onComplete, language }: TerminalBootProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const lines = bootLines[language];

  useEffect(() => {
    if (currentLine < lines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 600 + Math.random() * 400);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLine, lines.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-system-bg z-50 flex items-center justify-center p-6 font-mono">
      <div className="max-w-2xl w-full">
        <div className="space-y-2">
          {lines.slice(0, currentLine).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-system-accent flex items-start gap-2"
            >
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span>{line}</span>
            </motion.div>
          ))}
          {currentLine < lines.length && (
            <div className="text-system-accent flex items-start gap-2">
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span className="flex items-center">
                {lines[currentLine]}
                <span className="terminal-cursor" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
