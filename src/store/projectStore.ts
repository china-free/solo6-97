import { create } from 'zustand';
import { Project, ProjectType, ProjectStatus, SortType, Milestone } from '@/types';
import { mockProjects } from '@/data/mockProjects';

interface ProjectState {
  projects: Project[];
  filterType: ProjectType | 'all';
  filterStatus: ProjectStatus | 'all';
  sortType: SortType;
  selectedProjectId: string | null;
  isFormOpen: boolean;
  editingProject: Project | null;
}

interface ProjectActions {
  setFilterType: (type: ProjectType | 'all') => void;
  setFilterStatus: (status: ProjectStatus | 'all') => void;
  setSortType: (type: SortType) => void;
  setSelectedProjectId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setEditingProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (activeId: string, overId: string) => void;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;
  getFilteredAndSortedProjects: () => Project[];
}

const loadFromStorage = (): Project[] | null => {
  try {
    const stored = localStorage.getItem('portfolio-projects');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
  }
  return null;
};

const saveToStorage = (projects: Project[]) => {
  try {
    localStorage.setItem('portfolio-projects', JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => {
  const initialProjects = loadFromStorage() || mockProjects;
  
  return {
    projects: initialProjects,
    filterType: 'all',
    filterStatus: 'all',
    sortType: 'manual',
    selectedProjectId: null,
    isFormOpen: false,
    editingProject: null,

    setFilterType: (type) => set({ filterType: type }),
    setFilterStatus: (status) => set({ filterStatus: status }),
    setSortType: (type) => set({ sortType: type }),
    setSelectedProjectId: (id) => set({ selectedProjectId: id }),
    setIsFormOpen: (open) => set({ isFormOpen: open, editingProject: null }),
    setEditingProject: (project) => set({ editingProject: project, isFormOpen: true }),

    addProject: (projectData) => {
      const newProject: Project = {
        ...projectData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: get().projects.length,
      };
      const newProjects = [...get().projects, newProject];
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    updateProject: (id, data) => {
      const newProjects = get().projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    deleteProject: (id) => {
      const newProjects = get().projects.filter((p) => p.id !== id);
      set({ 
        projects: newProjects,
        selectedProjectId: get().selectedProjectId === id ? null : get().selectedProjectId,
      });
      saveToStorage(newProjects);
    },

    reorderProjects: (activeId, overId) => {
      const projects = [...get().projects];
      const activeIndex = projects.findIndex((p) => p.id === activeId);
      const overIndex = projects.findIndex((p) => p.id === overId);
      
      if (activeIndex === -1 || overIndex === -1) return;
      
      const [removed] = projects.splice(activeIndex, 1);
      projects.splice(overIndex, 0, removed);
      
      const reorderedProjects = projects.map((p, index) => ({ ...p, order: index }));
      set({ projects: reorderedProjects });
      saveToStorage(reorderedProjects);
    },

    addMilestone: (projectId, milestone) => {
      const newMilestone: Milestone = {
        ...milestone,
        id: generateId(),
      };
      const newProjects = get().projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: [...p.milestones, newMilestone],
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    updateMilestone: (projectId, milestoneId, data) => {
      const newProjects = get().projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId ? { ...m, ...data } : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    deleteMilestone: (projectId, milestoneId) => {
      const newProjects = get().projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              milestones: p.milestones.filter((m) => m.id !== milestoneId),
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    getFilteredAndSortedProjects: () => {
      const { projects, filterType, filterStatus, sortType } = get();
      
      let filtered = projects;
      
      if (filterType !== 'all') {
        filtered = filtered.filter((p) => p.type === filterType);
      }
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter((p) => p.status === filterStatus);
      }
      
      const sorted = [...filtered];
      switch (sortType) {
        case 'manual':
          sorted.sort((a, b) => a.order - b.order);
          break;
        case 'date-desc':
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'date-asc':
          sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
          break;
      }
      
      return sorted;
    },
  };
});
