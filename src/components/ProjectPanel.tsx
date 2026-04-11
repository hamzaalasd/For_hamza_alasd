import { Project, Language } from '@/src/data/portfolio';
import { motion } from 'motion/react';
import { Code2, Activity, Cpu, Globe, Smartphone, Layers, CheckCircle2, Clock, Zap } from 'lucide-react';

interface ProjectPanelProps {
  project: Project;
  language: Language;
}

export default function ProjectPanel({ project, language }: ProjectPanelProps) {
  const typeIcon = {
    web: Globe,
    mobile: Smartphone,
    fullstack: Layers,
  }[project.type];

  const TypeIcon = typeIcon;

  const typeLabel = {
    web: { ar: 'تطبيق ويب', en: 'Web Application' },
    mobile: { ar: 'تطبيق موبايل', en: 'Mobile Application' },
    fullstack: { ar: 'ويب + API', en: 'Fullstack / Web + API' },
  }[project.type];

  const statusConfig = {
    production: {
      label: { ar: 'في الإنتاج', en: 'In Production' },
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      icon: Zap,
      dot: 'bg-emerald-400',
    },
    development: {
      label: { ar: 'قيد التطوير', en: 'In Development' },
      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      icon: Clock,
      dot: 'bg-yellow-400',
    },
    completed: {
      label: { ar: 'مكتمل', en: 'Completed' },
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      icon: CheckCircle2,
      dot: 'bg-blue-400',
    },
  }[project.status];

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <header className="space-y-5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-system-accent">
            <Cpu size={14} />
            <span>PROJECT_ID: {project.id.padStart(3, '0')}</span>
          </div>

          <div className="flex items-center gap-1.5 text-system-muted px-2 py-0.5 rounded border border-system-border">
            <TypeIcon size={13} />
            <span>{typeLabel[language]}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${statusConfig.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
            <StatusIcon size={12} />
            <span>{statusConfig.label[language]}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{project.title[language]}</h1>
        <p className="text-xl text-system-muted max-w-2xl leading-relaxed">
          {project.description[language]}
        </p>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {project.metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-6 bg-system-card border border-system-border rounded-xl space-y-2 hover:border-system-accent/40 transition-colors group"
          >
            <div className="text-xs text-system-muted font-mono uppercase tracking-wider">
              {metric.label[language]}
            </div>
            <div className="text-2xl font-bold text-system-accent font-mono group-hover:scale-105 transition-transform origin-left">
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Problem & Solution */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-system-accent uppercase tracking-wider text-sm">
          <Activity size={16} />
          {language === 'ar' ? '// المشكلة والحل' : '// Problem & Solution'}
        </h2>
        <div className="p-6 bg-system-card/50 border border-system-border rounded-xl hover:border-system-accent/30 transition-colors">
          <p className="text-system-text/90 leading-relaxed text-[15px]">
            {project.problem[language]}
          </p>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-system-accent uppercase tracking-wider text-sm">
          <Code2 size={16} />
          {language === 'ar' ? '// مقتطف من الكود' : '// Code Snippet'}
        </h2>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-system-accent/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative rounded-xl overflow-hidden border border-system-border">
            {/* Code Header Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border-b border-system-border">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] font-mono text-system-muted uppercase tracking-widest">
                {project.slug}.{project.type === 'mobile' ? 'dart' : 'php'}
              </span>
            </div>
            <pre className="p-6 bg-black/80 overflow-x-auto font-mono text-sm text-system-accent/90 leading-relaxed">
              <code>{project.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-system-accent uppercase tracking-wider text-sm">
          <Cpu size={16} />
          {language === 'ar' ? '// المعمارية' : '// Architecture'}
        </h2>
        <div className="p-5 bg-system-card/30 border border-system-border rounded-xl font-mono text-sm text-system-muted">
          <span className="text-system-accent font-bold">◈ </span>
          {project.architecture}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 font-mono text-system-accent uppercase tracking-wider text-sm">
          <Layers size={16} />
          {language === 'ar' ? '// التقنيات المستخدمة' : '// Tech Stack'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-3 py-1.5 bg-system-border hover:bg-system-accent/10 hover:border-system-accent/30 hover:text-system-accent text-system-text border border-system-border text-xs font-mono rounded-lg transition-all cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
