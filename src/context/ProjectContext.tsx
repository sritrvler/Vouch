'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  slug: string | null;
  website: string | null;
  google_review_url: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  accent_color: string;
  font_family: string | null;
  font_url: string | null;
  report_token: string | null;
}

interface ProjectContextValue {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  plan: 'free' | 'pro' | 'agency';
  loading: boolean;
  switchProject: (id: string) => void;
  refetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'vouch_selected_project';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro' | 'agency'>('free');
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [projectsRes, subRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, slug, website, google_review_url, linkedin_url, logo_url, accent_color, font_family, font_url, report_token')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single(),
    ]);

    const fetched = (projectsRes.data ?? []) as Project[];
    setProjects(fetched);

    if (subRes.data) {
      setPlan(subRes.data.plan as 'free' | 'pro' | 'agency');
    }

    // Initialize selected project from localStorage, fallback to first
    const stored = localStorage.getItem(STORAGE_KEY);
    const validStored = fetched.find((p) => p.id === stored);
    if (validStored) {
      setSelectedProjectId(validStored.id);
    } else if (fetched.length > 0) {
      setSelectedProjectId(fetched[0].id);
      localStorage.setItem(STORAGE_KEY, fetched[0].id);
    } else {
      setSelectedProjectId(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const switchProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const refetchProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      selectedProjectId,
      selectedProject,
      plan,
      loading,
      switchProject,
      refetchProjects,
    }),
    [projects, selectedProjectId, selectedProject, plan, loading, switchProject, refetchProjects]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
