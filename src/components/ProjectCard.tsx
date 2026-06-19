import { Project, PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types';
import { ProgressBar } from './ProgressBar';
import { useProjectStore } from '@/store/projectStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  isDragging?: boolean;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { setSelectedProjectId, setEditingProject, deleteProject } = useProjectStore();
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'archived': 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };

  const typeColors = {
    'ui-design': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'web-development': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'illustration': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'branding': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'other': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };

  const handleCardClick = () => {
    setSelectedProjectId(project.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个项目吗？')) {
      deleteProject(project.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden',
        'border border-zinc-200 dark:border-zinc-800',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:shadow-zinc-900/5 dark:hover:shadow-black/30',
        'hover:-translate-y-1',
        'cursor-pointer',
        isDragging && 'opacity-50 scale-[0.98]',
        project.status === 'archived' && 'opacity-60'
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={project.coverImage}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full',
            statusColors[project.status]
          )}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
          
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full',
            typeColors[project.type]
          )}>
            {PROJECT_TYPE_LABELS[project.type]}
          </span>
        </div>

        <div
          className={cn(
            'absolute top-3 right-3 flex gap-1.5 transition-all duration-200',
            showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 cursor-grab active:cursor-grabbing"
            title="拖拽排序"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {project.name}
          </h3>
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={(e) => e.stopPropagation()}
              title="访问项目"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 h-10">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-500">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        {project.status === 'in-progress' && (
          <ProgressBar progress={project.progress} status="in-progress" size="sm" showLabel />
        )}
      </div>
    </div>
  );
}
