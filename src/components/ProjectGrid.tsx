import { useProjectStore } from '@/store/projectStore';
import { ProjectCard } from './ProjectCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { FolderOpen } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@/types';

export function ProjectGrid() {
  const { projects, getFilteredAndSortedProjects, moveProject, sortType } = useProjectStore();
  const filteredProjects = getFilteredAndSortedProjects();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeProject = activeId
    ? projects.find((p) => p.id === activeId) || null
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      moveProject(String(active.id), String(over.id));
    }
  };

  const isManualSort = sortType === 'manual';

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 dark:text-zinc-400">
        <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">暂无项目</p>
        <p className="text-sm">
          {projects.length === 0
            ? '点击"添加项目"按钮创建你的第一个项目吧'
            : '当前筛选条件下没有项目'}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={isManualSort ? filteredProjects.map((p) => p.id) : []}
        strategy={rectSortingStrategy}
        disabled={!isManualSort}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeProject ? (
          <DragOverlayCard project={activeProject} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragOverlayCard({ project }: { project: Project }) {
  return (
    <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-2xl opacity-90 rotate-2">
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={project.coverImage}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {project.name}
        </h3>
      </div>
    </div>
  );
}
