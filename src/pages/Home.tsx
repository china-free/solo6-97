import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProjectGrid } from '@/components/ProjectGrid';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectForm } from '@/components/ProjectForm';
import { useProjectStore } from '@/store/projectStore';

export default function Home() {
  const { getFilteredAndSortedProjects, projects } = useProjectStore();
  const filteredCount = getFilteredAndSortedProjects().length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            我的作品
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            共 {projects.length} 个项目
            {filteredCount !== projects.length && (
              <span className="ml-2 text-sm">
                （筛选后 {filteredCount} 个）
              </span>
            )}
          </p>
        </div>

        <div className="mb-6">
          <FilterBar />
        </div>

        <ProjectGrid />
      </main>

      <ProjectModal />
      <ProjectForm />
    </div>
  );
}
