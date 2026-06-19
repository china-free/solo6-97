import { useProjectStore } from '@/store/projectStore';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, SORT_TYPE_LABELS } from '@/types';
import type { ProjectType, ProjectStatus, SortType } from '@/types';
import { cn } from '@/lib/utils';
import { Filter, ArrowUpDown } from 'lucide-react';

export function FilterBar() {
  const { 
    filterType, 
    filterStatus, 
    sortType,
    setFilterType, 
    setFilterStatus, 
    setSortType 
  } = useProjectStore();

  const types: (ProjectType | 'all')[] = ['all', 'ui-design', 'web-development', 'illustration', 'branding', 'other'];
  const statuses: (ProjectStatus | 'all')[] = ['all', 'in-progress', 'completed', 'archived'];
  const sortOptions: SortType[] = ['manual', 'date-desc', 'date-asc', 'name'];

  const getTypeLabel = (type: ProjectType | 'all') => {
    return type === 'all' ? '全部类型' : PROJECT_TYPE_LABELS[type];
  };

  const getStatusLabel = (status: ProjectStatus | 'all') => {
    return status === 'all' ? '全部状态' : PROJECT_STATUS_LABELS[status];
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">筛选：</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
              filterType === type
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

      <div className="flex flex-wrap gap-1">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-all duration-200',
              filterStatus === status
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-zinc-500" />
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className={cn(
            'text-sm rounded-lg border-0 bg-transparent',
            'text-zinc-700 dark:text-zinc-300',
            'focus:outline-none focus:ring-2 focus:ring-zinc-500/20',
            'cursor-pointer'
          )}
        >
          {sortOptions.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_TYPE_LABELS[sort]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
