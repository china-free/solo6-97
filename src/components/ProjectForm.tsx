import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from '@/types';
import type { ProjectType, ProjectStatus, Milestone } from '@/types';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectForm() {
  const { isFormOpen, editingProject, setIsFormOpen, addProject, updateProject } = useProjectStore();
  const isEditing = !!editingProject;

  const [formData, setFormData] = useState({
    name: '',
    type: 'ui-design' as ProjectType,
    coverImage: '',
    description: '',
    techStack: '' as string,
    projectUrl: '',
    status: 'in-progress' as ProjectStatus,
    progress: 0,
    milestones: [] as Milestone[],
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        type: editingProject.type,
        coverImage: editingProject.coverImage,
        description: editingProject.description,
        techStack: editingProject.techStack.join(', '),
        projectUrl: editingProject.projectUrl,
        status: editingProject.status,
        progress: editingProject.progress,
        milestones: editingProject.milestones,
      });
    } else {
      setFormData({
        name: '',
        type: 'ui-design',
        coverImage: '',
        description: '',
        techStack: '',
        projectUrl: '',
        status: 'in-progress',
        progress: 0,
        milestones: [],
      });
    }
  }, [editingProject, isFormOpen]);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        setIsFormOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFormOpen, setIsFormOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      name: formData.name,
      type: formData.type,
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      description: formData.description,
      techStack: formData.techStack.split(',').map((t) => t.trim()).filter(Boolean),
      projectUrl: formData.projectUrl,
      status: formData.status,
      progress: formData.status === 'completed' ? 100 : formData.progress,
      milestones: formData.milestones,
    };

    if (isEditing && editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }

    setIsFormOpen(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.date) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      date: newMilestone.date,
      description: newMilestone.description,
    };

    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
    }));

    setNewMilestone({ title: '', date: '', description: '' });
  };

  const handleRemoveMilestone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFormOpen(false);
    }
  };

  if (!isFormOpen) return null;

  const projectTypes: ProjectType[] = ['ui-design', 'web-development', 'illustration', 'branding', 'other'];
  const projectStatuses: ProjectStatus[] = ['in-progress', 'completed', 'archived'];

  const statusColors = {
    'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'archived': 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {isEditing ? '编辑项目' : '添加项目'}
          </h2>
          <button
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                项目名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder="请输入项目名称"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  项目类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as ProjectType }))}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {PROJECT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  项目状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const status = e.target.value as ProjectStatus;
                    setFormData((prev) => ({
                      ...prev,
                      status,
                      progress: status === 'completed' ? 100 : prev.progress,
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {PROJECT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                封面图 URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              {formData.coverImage && (
                <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={formData.coverImage}
                    alt="预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                项目描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none"
                placeholder="描述一下这个项目..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                技术栈
                <span className="text-zinc-400 font-normal ml-1">（用逗号分隔）</span>
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData((prev) => ({ ...prev, techStack: e.target.value }))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder="React, TypeScript, Tailwind CSS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                项目链接
              </label>
              <input
                type="url"
                value={formData.projectUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder="https://example.com"
              />
            </div>

            {formData.status === 'in-progress' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  项目进度: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, progress: Number(e.target.value) }))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                项目里程碑
              </label>

              {formData.milestones.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {milestone.title}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {milestone.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                  placeholder="里程碑名称"
                />
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                />
                <input
                  type="text"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
                  placeholder="里程碑描述（可选）"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.title.trim() || !newMilestone.date}
                  className={cn(
                    'w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    newMilestone.title.trim() && newMilestone.date
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
                      : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  添加里程碑
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex-1 px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {isEditing ? '保存修改' : '创建项目'}
            </button>
          </div>
        </form>
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
