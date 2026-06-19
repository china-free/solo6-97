import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  status?: 'in-progress' | 'completed' | 'archived';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  progress, 
  status = 'in-progress', 
  showLabel = false,
  size = 'md',
  className 
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  const colorClass = {
    'in-progress': 'bg-amber-500',
    'completed': 'bg-emerald-500',
    'archived': 'bg-zinc-400',
  }[status];

  const displayProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>进度</span>
          <span className="font-medium">{Math.round(displayProgress)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden',
        heightClass
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClass
          )}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
}
