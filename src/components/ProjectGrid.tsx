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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { FolderOpen } from 'lucide-react';

export function ProjectGrid() {
  const { projects, getFilteredAndSortedProjects, reorderProjects, sortType } = useProjectStore();
  const filteredProjects = getFilteredAndSortedProjects();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderProjects(String(active.id), String(over.id));
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
    </DndContext>
  );
}
