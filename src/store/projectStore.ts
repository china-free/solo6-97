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
  moveProject: (activeId: string, overId: string) => void;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;
  getFilteredProjects: () => Project[];
  getSortedProjects: (projects: Project[]) => Project[];
  getFilteredAndSortedProjects: () => Project[];
}

const STORAGE_KEY = 'portfolio-projects';

const loadFromStorage = (): Project[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getInitialProjects = (): Project[] => {
  const stored = loadFromStorage();
  if (stored) {
    const hasOrderField = stored.every((p) => typeof p.order === 'number');
    if (hasOrderField) {
      return stored;
    }
    return stored.map((p, i) => ({ ...p, order: i }));
  }
  return mockProjects.map((p, i) => ({ ...p, order: i * 1000 }));
};

const computeOrderBetween = (before: number | null, after: number | null): number => {
  if (before === null && after === null) {
    return 1000;
  }
  if (before === null) {
    return after! - 1000;
  }
  if (after === null) {
    return before + 1000;
  }
  return (before + after) / 2;
};

const MIN_ORDER_DIFF = 1e-6;

const renormalizeOrders = (projects: Project[]): Project[] => {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  return sorted.map((p, i) => ({ ...p, order: i * 1000 }));
};

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => {
  const initialProjects = getInitialProjects();
  
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
      const { projects } = get();
      const maxOrder = projects.length > 0 
        ? Math.max(...projects.map((p) => p.order)) 
        : 0;
      
      const newProject: Project = {
        ...projectData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: maxOrder + 1000,
      };
      
      const newProjects = [...projects, newProject];
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    updateProject: (id, data) => {
      const { projects } = get();
      const newProjects = projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    deleteProject: (id) => {
      const { projects, selectedProjectId } = get();
      const newProjects = projects.filter((p) => p.id !== id);
      set({ 
        projects: newProjects,
        selectedProjectId: selectedProjectId === id ? null : selectedProjectId,
      });
      saveToStorage(newProjects);
    },

    moveProject: (activeId, overId) => {
      const { projects, filterType, filterStatus } = get();

      const projectMap = new Map(projects.map((p) => [p.id, p]));
      const activeProject = projectMap.get(activeId);
      const overProject = projectMap.get(overId);

      if (!activeProject || !overProject) return;
      if (activeId === overId) return;

      const globalSorted = [...projects].sort((a, b) => a.order - b.order);
      const globalOverIndex = globalSorted.findIndex((p) => p.id === overId);
      
      if (globalOverIndex === -1) return;

      let filteredProjects = [...projects];
      if (filterType !== 'all') {
        filteredProjects = filteredProjects.filter((p) => p.type === filterType);
      }
      if (filterStatus !== 'all') {
        filteredProjects = filteredProjects.filter((p) => p.status === filterStatus);
      }
      filteredProjects.sort((a, b) => a.order - b.order);

      const activeIndex = filteredProjects.findIndex((p) => p.id === activeId);
      const overIndex = filteredProjects.findIndex((p) => p.id === overId);
      
      if (activeIndex === -1 || overIndex === -1) return;

      let prevOrder: number | null = null;
      let nextOrder: number | null = null;

      if (activeIndex < overIndex) {
        prevOrder = overProject.order;
        nextOrder = globalOverIndex < globalSorted.length - 1
          ? globalSorted[globalOverIndex + 1].order
          : null;
      } else {
        prevOrder = globalOverIndex > 0
          ? globalSorted[globalOverIndex - 1].order
          : null;
        nextOrder = overProject.order;
      }

      let newOrder = computeOrderBetween(prevOrder, nextOrder);

      if (
        (prevOrder !== null && Math.abs(newOrder - prevOrder) < MIN_ORDER_DIFF) ||
        (nextOrder !== null && Math.abs(newOrder - nextOrder) < MIN_ORDER_DIFF)
      ) {
        const renormalized = renormalizeOrders(projects);
        const renormSorted = [...renormalized].sort((a, b) => a.order - b.order);
        const renormOverIndex = renormSorted.findIndex((p) => p.id === overId);
        const renormActive = renormSorted.find((p) => p.id === activeId);
        
        if (renormOverIndex === -1 || !renormActive) return;
        
        const renormFiltered = renormalized.filter((p) => 
          (filterType === 'all' || p.type === filterType) &&
          (filterStatus === 'all' || p.status === filterStatus)
        ).sort((a, b) => a.order - b.order);
        
        const renormActiveIndex = renormFiltered.findIndex((p) => p.id === activeId);
        const renormOverIndexFiltered = renormFiltered.findIndex((p) => p.id === overId);
        
        if (renormActiveIndex < renormOverIndexFiltered) {
          prevOrder = renormSorted[renormOverIndex].order;
          nextOrder = renormOverIndex < renormSorted.length - 1
            ? renormSorted[renormOverIndex + 1].order
            : null;
        } else {
          prevOrder = renormOverIndex > 0
            ? renormSorted[renormOverIndex - 1].order
            : null;
          nextOrder = renormSorted[renormOverIndex].order;
        }
        
        newOrder = computeOrderBetween(prevOrder, nextOrder);
        
        const finalProjects = renormalized.map((p) =>
          p.id === activeId ? { ...p, order: newOrder } : p
        );
        
        set({ projects: finalProjects });
        saveToStorage(finalProjects);
        return;
      }

      const newProjects = projects.map((p) =>
        p.id === activeId ? { ...p, order: newOrder } : p
      );

      set({ projects: newProjects });
      saveToStorage(newProjects);
    },

    addMilestone: (projectId, milestone) => {
      const { projects } = get();
      const newMilestone: Milestone = {
        ...milestone,
        id: generateId(),
      };
      const newProjects = projects.map((p) =>
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
      const { projects } = get();
      const newProjects = projects.map((p) =>
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
      const { projects } = get();
      const newProjects = projects.map((p) =>
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

    getFilteredProjects: () => {
      const { projects, filterType, filterStatus } = get();
      
      let filtered = projects;
      
      if (filterType !== 'all') {
        filtered = filtered.filter((p) => p.type === filterType);
      }
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter((p) => p.status === filterStatus);
      }
      
      return filtered;
    },

    getSortedProjects: (projectsList) => {
      const { sortType } = get();
      
      const sorted = [...projectsList];
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

    getFilteredAndSortedProjects: () => {
      const filtered = get().getFilteredProjects();
      return get().getSortedProjects(filtered);
    },
  };
});
