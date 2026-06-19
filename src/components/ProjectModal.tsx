import { useProjectStore } from '@/store/projectStore';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types';
import { Timeline } from './Timeline';
import { ProgressBar } from './ProgressBar';
import { formatDate } from '@/utils/export';
import { X, ExternalLink, Calendar, Tag, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function ProjectModal() {
  const { projects, selectedProjectId, setSelectedProjectId } = useProjectStore();
  const project = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProjectId(null);
      }
    };

    if (selectedProjectId) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedProjectId, setSelectedProjectId]);

  if (!project) return null;

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedProjectId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <button
          onClick={() => setSelectedProjectId(null)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
            <img
              src={project.coverImage}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                statusColors[project.status]
              )}>
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                typeColors[project.type]
              )}>
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              {project.name}
            </h2>

            <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-6 leading-relaxed">
              {project.description}
            </p>

            {project.status === 'in-progress' && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <ProgressBar progress={project.progress} status="in-progress" showLabel />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">技术栈</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">创建时间</p>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                访问项目
              </a>
            )}

            <div className="mt-10">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-zinc-400" />
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  项目里程碑
                </h3>
              </div>
              <Timeline milestones={project.milestones} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
