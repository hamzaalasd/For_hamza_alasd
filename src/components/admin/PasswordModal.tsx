import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, Terminal, ShieldCheck, ShieldX } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (ok) {
      setSuccess(true);
      setTimeout(onClose, 1200);
    } else {
      setAttempts(a => a + 1);
      setError(
        attempts >= 2
          ? '⚠️ محاولات خاطئة متعددة — تأكد من الكلمة'
          : '❌ كلمة السر غير صحيحة'
      );
      setPassword('');
      inputRef.current?.focus();
      setTimeout(() => setError(''), 2500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-system-border bg-system-card overflow-hidden shadow-2xl shadow-black/50">
            {/* Accent top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-system-accent to-transparent" />

            {/* Header */}
            <div className="p-6 border-b border-system-border flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-system-accent/10 border border-system-accent/20">
                <Lock size={20} className="text-system-accent" />
              </div>
              <div>
                <h2 className="font-bold text-system-text font-mono">ADMIN_ACCESS</h2>
                <p className="text-[11px] text-system-muted font-mono mt-0.5">
                  CLEARANCE_LEVEL: OWNER_ONLY
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Terminal display */}
              <div className="p-4 bg-black rounded-xl border border-system-border font-mono text-xs space-y-1">
                <p className="text-system-muted">$ ssh admin@portfolio.local</p>
                <p className="text-system-accent">Connected to ARCHITECT_CONSOLE_V1.0</p>
                <p className="text-system-muted">Awaiting authentication...</p>
                <p className="text-system-text flex items-center gap-1">
                  <span className="text-system-accent">▶</span>
                  <span>Enter admin password</span>
                  <span className="terminal-cursor" />
                </p>
              </div>

              {/* Success state */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                >
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-bold font-mono text-sm">ACCESS GRANTED</p>
                    <p className="text-emerald-400/70 text-xs font-mono">Welcome, Admin.</p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      autoFocus
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className={`w-full px-4 py-3 bg-system-bg border rounded-xl font-mono text-sm text-system-text placeholder:text-system-muted/40 outline-none transition-all pr-10 ${
                        error
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-system-border focus:border-system-accent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute inset-y-0 left-3 flex items-center text-system-muted hover:text-system-text transition-colors"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-red-400 text-xs font-mono p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        <ShieldX size={14} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!password}
                      className="flex-1 py-3 bg-system-accent text-black font-bold font-mono rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      AUTHENTICATE →
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-3 border border-system-border hover:bg-system-border rounded-xl transition-colors font-mono text-sm text-system-muted"
                    >
                      ESC
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-system-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-system-muted">
                <Terminal size={10} />
                <span>PORTFOLIO_ADMIN_v1</span>
              </div>
              <span className="text-[10px] font-mono text-system-muted/50">
                AES-PROTECTED
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
