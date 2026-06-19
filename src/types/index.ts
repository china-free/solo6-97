export type ProjectStatus = 'in-progress' | 'completed' | 'archived';
export type ProjectType = 'ui-design' | 'web-development' | 'illustration' | 'branding' | 'other';
export type SortType = 'manual' | 'date-desc' | 'date-asc' | 'name';

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  coverImage: string;
  description: string;
  techStack: string[];
  projectUrl: string;
  status: ProjectStatus;
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'ui-design': 'UI设计',
  'web-development': 'Web开发',
  'illustration': '插画',
  'branding': '品牌设计',
  'other': '其他',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'in-progress': '进行中',
  'completed': '已完成',
  'archived': '已归档',
};

export const SORT_TYPE_LABELS: Record<SortType, string> = {
  'manual': '手动排序',
  'date-desc': '最新优先',
  'date-asc': '最早优先',
  'name': '按名称',
};
