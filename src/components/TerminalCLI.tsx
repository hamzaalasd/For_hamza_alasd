import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon, Mail, Phone, Github, Linkedin, MessageCircle } from 'lucide-react';
import { BioData } from '../context/AdminContext';
import { Language } from '../data/portfolio';

interface TerminalCLIProps {
  bio: BioData;
  language: Language;
}

interface CommandOutput {
  id: string;
  command: string;
  output: React.ReactNode;
}

export default function TerminalCLI({ bio, language }: TerminalCLIProps) {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    let output: React.ReactNode;

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-system-accent">
            <p>Available commands:</p>
            <table className="w-full text-left">
              <tbody>
                <tr><td className="pr-4 text-white">help</td><td>Show available commands</td></tr>
                <tr><td className="pr-4 text-white">hire</td><td>Initiate WhatsApp contact</td></tr>
                <tr><td className="pr-4 text-white">projects</td><td>List featured projects</td></tr>
                <tr><td className="pr-4 text-white">skills</td><td>List technical skills</td></tr>
                <tr><td className="pr-4 text-white">contact</td><td>Display contact information</td></tr>
                <tr><td className="pr-4 text-white">clear</td><td>Clear terminal screen</td></tr>
              </tbody>
            </table>
          </div>
        );
        break;

      case 'hire':
        if (bio.whatsapp) {
          const waLink = `https://wa.me/${bio.whatsapp.replace(/[^0-9]/g, '')}`;
          window.open(waLink, '_blank');
          output = <p className="text-emerald-400">Opening secure communication channel... [WhatsApp]</p>;
        } else {
          output = <p className="text-yellow-400">Communication channel currently unavailable.</p>;
        }
        break;

      case 'projects':
        output = <p className="text-system-muted">Navigate to the PROJECTS section using the sidebar to view full case studies.</p>;
        break;

      case 'skills':
        output = <p className="text-system-muted">Navigate to the SKILLS ARCHITECTURE section to view the skill tree.</p>;
        break;

      case 'contact':
        output = (
          <div className="space-y-1 text-system-accent">
            <p className="text-white mb-2">SYSTEM.CONTACT_PROTOCOLS:</p>
            {bio.email && <p>&#62; EMAIL: <a href={`mailto:${bio.email}`} className="text-blue-400 hover:underline">{bio.email}</a></p>}
            {bio.whatsapp && <p>&#62; WHATSAPP: {bio.whatsapp}</p>}
            {bio.github && <p>&#62; GITHUB: <a href={bio.github} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{bio.github}</a></p>}
            {bio.linkedin && <p>&#62; LINKEDIN: <a href={bio.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{bio.linkedin}</a></p>}
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      default:
        output = <p className="text-red-400">Command not found: {cmd}. Type 'help' for available commands.</p>;
    }

    setHistory(prev => [...prev, { id: Date.now().toString(), command: input, output }]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold font-mono tracking-tighter flex items-center gap-3">
          <TerminalIcon size={32} className="text-system-accent" />
          {language === 'ar' ? 'الوحدة الطرفية (CLI)' : 'Terminal Interface'}
        </h1>
        <p className="text-xl text-system-muted">
          {language === 'ar' 
            ? 'تفاعل مع النظام عبر سطر الأوامر للوصول السريع إلى الموارد.'
            : 'Interact with the system via command-line for quick resource access.'}
        </p>
      </header>

      {/* Quick Actions for Non-Developers */}
      <div className="flex flex-wrap gap-3 py-2">
        {bio.whatsapp && (
          <a href={`https://wa.me/${bio.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-black transition-all hover:scale-105">
            <MessageCircle size={16} />
            <span className="font-bold text-sm">WhatsApp</span>
          </a>
        )}
        {bio.email && (
          <a href={`mailto:${bio.email}`} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all hover:scale-105">
            <Mail size={16} />
            <span className="font-bold text-sm">Email</span>
          </a>
        )}
        {bio.linkedin && (
          <a href={bio.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2] rounded-xl hover:bg-[#0A66C2] hover:text-white transition-all hover:scale-105">
            <Linkedin size={16} />
            <span className="font-bold text-sm">LinkedIn</span>
          </a>
        )}
        {bio.github && (
          <a href={bio.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 text-white rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105">
            <Github size={16} />
            <span className="font-bold text-sm">GitHub</span>
          </a>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-[60vh] bg-black/80 border border-system-border rounded-xl flex flex-col font-mono text-sm shadow-2xl shadow-system-accent/10"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-system-card border-b border-system-border rounded-t-xl shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs text-system-muted">guest@architect-console:~</span>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-system-muted/80">
            <p>Welcome to Architect Console v1.1.</p>
            <p>Type 'help' to see available commands.</p>
            <br/>
          </div>

          {history.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center gap-2 text-system-accent">
                <span className="text-emerald-500">➜</span>
                <span className="text-blue-400">~</span>
                <span className="text-white">{item.command}</span>
              </div>
              <div className="pl-4">
                {item.output}
              </div>
            </div>
          ))}

          {/* Active Input Line */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 text-system-accent">
            <span className="text-emerald-500">➜</span>
            <span className="text-blue-400">~</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white p-0 m-0 focus:ring-0 placeholder:text-system-muted/30"
              autoFocus
              spellCheck="false"
              autoComplete="off"
            />
          </form>
          <div ref={bottomRef} />
        </div>
      </motion.div>
    </div>
  );
}
