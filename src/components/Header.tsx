import { ThemeToggle } from './ThemeToggle';
import { useProjectStore } from '@/store/projectStore';
import { exportToJson } from '@/utils/export';
import { Plus, Download, Briefcase } from 'lucide-react';

export function Header() {
  const { projects, setIsFormOpen } = useProjectStore();

  const handleExport = () => {
    exportToJson(projects);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                Portfolio
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                个人作品集
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              导出 JSON
            </button>
            
            <ThemeToggle />

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">添加项目</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
