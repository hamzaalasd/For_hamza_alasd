import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Github, GitCommit, GitPullRequest, Star, Users } from 'lucide-react';
import { Language } from '../data/portfolio';

interface GitHubStatsProps {
  username: string;
  language: Language;
}

interface GitStats {
  followers: number;
  publicRepos: number;
  stars: number;
  loading: boolean;
  error: boolean;
}

export default function GitHubStats({ username, language }: GitHubStatsProps) {
  const [stats, setStats] = useState<GitStats>({ followers: 0, publicRepos: 0, stars: 0, loading: true, error: false });

  // Extract username from URL if necessary
  const getUsername = (urlOrName: string) => {
    if (!urlOrName) return '';
    try {
      const url = new URL(urlOrName);
      const paths = url.pathname.split('/').filter(Boolean);
      return paths.length > 0 ? paths[0] : urlOrName;
    } catch {
      // If it's just a username instead of a full URL
      return urlOrName;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const gUsername = getUsername(username);
      if (!gUsername) {
        setStats(prev => ({ ...prev, loading: false, error: true }));
        return;
      }

      try {
        // Fetch user data
        const userRes = await fetch(`https://api.github.com/users/${gUsername}`);
        if (!userRes.ok) throw new Error('User not found');
        const userData = await userRes.json();
        
        // Fetch repositories for stars
        const reposRes = await fetch(`https://api.github.com/users/${gUsername}/repos?per_page=100`);
        const reposData = await reposRes.json();
        const totalStars = Array.isArray(reposData) 
          ? reposData.reduce((acc: number, curr: any) => acc + curr.stargazers_count, 0)
          : 0;

        if (isMounted) {
          setStats({
            followers: userData.followers,
            publicRepos: userData.public_repos,
            stars: totalStars,
            loading: false,
            error: false,
          });
        }
      } catch (err) {
        if (isMounted) setStats(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, [username]);

  if (stats.loading || stats.error) {
    return (
      <div className="p-4 border border-system-border border-dashed rounded-xl flex items-center justify-center gap-2 text-system-muted text-sm font-mono mt-8">
        <Github size={16} className="animate-pulse" />
        {stats.loading ? (language === 'ar' ? 'جاري الاتصال بـ GitHub...' : 'CONNECTING TO GITHUB...') : (language === 'ar' ? 'لم يتم العثور على بيانات GitHub' : 'GITHUB DATA NOT FOUND')}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 border border-system-border rounded-xl bg-system-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-system-border bg-black/40 text-xs font-mono">
        <Github size={14} className="text-system-accent" />
        <span className="text-system-text uppercase">GITHUB_LIVE_STATS :: {getUsername(username)}</span>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-3 divide-x divide-system-border/50 rtl:divide-x-reverse text-center">
        <div className="p-4 hover:bg-system-accent/5 transition-colors group">
          <GitCommit size={18} className="mx-auto mb-2 text-system-muted group-hover:text-system-accent transition-colors" />
          <div className="text-xl font-bold font-mono text-system-text">{stats.publicRepos}</div>
          <div className="text-[10px] text-system-muted mt-0.5 uppercase tracking-wider">{language === 'ar' ? 'مستودع' : 'Repositories'}</div>
        </div>
        
        <div className="p-4 hover:bg-system-accent/5 transition-colors group">
          <Star size={18} className="mx-auto mb-2 text-system-muted group-hover:text-system-accent transition-colors" />
          <div className="text-xl font-bold font-mono text-system-text">{stats.stars}</div>
          <div className="text-[10px] text-system-muted mt-0.5 uppercase tracking-wider">{language === 'ar' ? 'نجوم' : 'Total Stars'}</div>
        </div>

        <div className="p-4 hover:bg-system-accent/5 transition-colors group">
          <Users size={18} className="mx-auto mb-2 text-system-muted group-hover:text-system-accent transition-colors" />
          <div className="text-xl font-bold font-mono text-system-text">{stats.followers}</div>
          <div className="text-[10px] text-system-muted mt-0.5 uppercase tracking-wider">{language === 'ar' ? 'متابع' : 'Followers'}</div>
        </div>
      </div>
    </motion.div>
  );
}
