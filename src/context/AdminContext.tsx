import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  projects as defaultProjects,
  skills as defaultSkills,
  certifications as defaultCerts,
  Project,
  Skill,
  Certification,
} from '../data/portfolio';

// ═══════════════════════════════════════════
// 🔐 PASSWORD — obfuscated (not plain text)
// Each number is char code: portfolio@2025
// ═══════════════════════════════════════════
const _k = [112,111,114,116,102,111,108,105,111,64,50,48,50,53];
const _verify = (input: string) => {
  const encoded = Array.from(input).map(c => c.charCodeAt(0));
  if (encoded.length !== _k.length) return false;
  return encoded.every((v, i) => v === _k[i]);
};

// ─── BIO Interface ──────────────────────────
export interface BioData {
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  stats: { numAr: string; numEn: string; labelAr: string; labelEn: string }[];
}

export const defaultBio: BioData = {
  nameAr: 'حمزة محمد',
  nameEn: 'Hamza Mohamed',
  titleAr: 'مطور برمجيات | Laravel & Flutter',
  titleEn: 'Software Developer | Laravel & Flutter',
  descriptionAr:
    'أبني أنظمة برمجية متكاملة من الويب إلى الموبايل — متخصص في Laravel لبناء APIs والأنظمة المؤسسية، وFlutter لتطوير تطبيقات أندرويد/iOS جاهزة للاستخدام الفعلي.',
  descriptionEn:
    'I build end-to-end software systems from web to mobile — specialized in Laravel for APIs & enterprise systems, and Flutter for production-ready Android/iOS applications.',
  stats: [
    { numAr: '+5', numEn: '5+', labelAr: 'مشروع منتج', labelEn: 'Live Projects' },
    { numAr: '3', numEn: '3', labelAr: 'نظام مؤسسي', labelEn: 'Enterprise Systems' },
    { numAr: '2', numEn: '2', labelAr: 'تطبيق Offline', labelEn: 'Offline Apps' },
    { numAr: '100%', numEn: '100%', labelAr: 'عربي اللغة', labelEn: 'Arabic-First' },
  ],
};

// ─── Firestore document ID ───────────────────
const FIRESTORE_DOC = 'portfolio/data';

// ─── Context Type ────────────────────────────
interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  // Data
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  bio: BioData;
  // Project CRUD
  updateProject: (p: Project) => void;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  // Cert CRUD
  updateCert: (c: Certification) => void;
  addCert: (c: Certification) => void;
  deleteCert: (id: string) => void;
  // Skill CRUD
  updateSkill: (s: Skill) => void;
  addSkill: (s: Skill) => void;
  deleteSkill: (id: string) => void;
  // Bio
  updateBio: (b: BioData) => void;
  // Reset
  resetToDefault: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

// ─── Save to Firestore ────────────────────────
async function saveToFirestore(data: Record<string, unknown>) {
  try {
    const ref = doc(db, 'portfolio', 'data');
    await setDoc(ref, data, { merge: true });
  } catch (err) {
    console.error('Firestore save error:', err);
  }
}

// ─── Provider ────────────────────────────────
export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [certifications, setCertifications] = useState<Certification[]>(defaultCerts);
  const [bio, setBio] = useState<BioData>(defaultBio);

  // ─── Load from Firestore on startup ──────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const ref = doc(db, 'portfolio', 'data');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.projects) setProjects(data.projects);
          if (data.skills) setSkills(data.skills);
          if (data.certs) setCertifications(data.certs);
          if (data.bio) setBio(data.bio);
        }
      } catch (err) {
        console.error('Firestore load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const login = useCallback((password: string) => {
    if (_verify(password)) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setIsAdmin(false), []);

  // Projects
  const updateProject = useCallback((p: Project) => {
    setProjects(prev => {
      const next = prev.map(x => x.id === p.id ? p : x);
      saveToFirestore({ projects: next });
      return next;
    });
  }, []);

  const addProject = useCallback((p: Project) => {
    setProjects(prev => {
      const next = [...prev, p];
      saveToFirestore({ projects: next });
      return next;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = prev.filter(x => x.id !== id);
      saveToFirestore({ projects: next });
      return next;
    });
  }, []);

  // Certs
  const updateCert = useCallback((c: Certification) => {
    setCertifications(prev => {
      const next = prev.map(x => x.id === c.id ? c : x);
      saveToFirestore({ certs: next });
      return next;
    });
  }, []);

  const addCert = useCallback((c: Certification) => {
    setCertifications(prev => {
      const next = [...prev, c];
      saveToFirestore({ certs: next });
      return next;
    });
  }, []);

  const deleteCert = useCallback((id: string) => {
    setCertifications(prev => {
      const next = prev.filter(x => x.id !== id);
      saveToFirestore({ certs: next });
      return next;
    });
  }, []);

  // Skills
  const updateSkill = useCallback((s: Skill) => {
    setSkills(prev => {
      const next = prev.map(x => x.id === s.id ? s : x);
      saveToFirestore({ skills: next });
      return next;
    });
  }, []);

  const addSkill = useCallback((s: Skill) => {
    setSkills(prev => {
      const next = [...prev, s];
      saveToFirestore({ skills: next });
      return next;
    });
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setSkills(prev => {
      const next = prev.filter(x => x.id !== id);
      saveToFirestore({ skills: next });
      return next;
    });
  }, []);

  // Bio
  const updateBio = useCallback((b: BioData) => {
    setBio(b);
    saveToFirestore({ bio: b });
  }, []);

  // Reset
  const resetToDefault = useCallback(async () => {
    setProjects(defaultProjects);
    setSkills(defaultSkills);
    setCertifications(defaultCerts);
    setBio(defaultBio);
    await saveToFirestore({
      projects: defaultProjects,
      skills: defaultSkills,
      certs: defaultCerts,
      bio: defaultBio,
    });
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdmin, loading, login, logout,
      projects, skills, certifications, bio,
      updateProject, addProject, deleteProject,
      updateCert, addCert, deleteCert,
      updateSkill, addSkill, deleteSkill,
      updateBio, resetToDefault,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
}
