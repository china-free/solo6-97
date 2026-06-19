import { Milestone } from '@/types';
import { formatDate } from '@/utils/export';
import { Circle, CircleDot } from 'lucide-react';

interface TimelineProps {
  milestones: Milestone[];
}

export function Timeline({ milestones }: TimelineProps) {
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        暂无里程碑记录
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
      
      <div className="space-y-6">
        {sortedMilestones.map((milestone, index) => {
          const isLast = index === sortedMilestones.length - 1;
          
          return (
            <div key={milestone.id} className="relative flex gap-4">
              <div className="relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {isLast ? (
                  <CircleDot className="w-5 h-5 text-amber-500" />
                ) : (
                  <Circle className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                )}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {milestone.title}
                  </h4>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(milestone.date)}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {milestone.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
