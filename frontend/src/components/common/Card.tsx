import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-slate-200/90 p-5 text-slate-800 shadow-sm shadow-slate-100 transition-all duration-200',
        'dark:bg-slate-900/60 dark:border-slate-800/80 dark:text-slate-100 dark:shadow-none dark:backdrop-blur-md',
        hoverEffect &&
          'hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 dark:hover:border-slate-700 dark:hover:bg-slate-900/80 dark:hover:shadow-lg dark:hover:shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  badge,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-sm shadow-slate-100/60 transition-all duration-200 hover:border-slate-300 hover:shadow-md',
        'dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-950/80 dark:border-slate-800/80 dark:shadow-none dark:hover:border-slate-700/80',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badge}
          {icon && (
            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/50">
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
            {subValue}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-medium text-[11px]',
              trend.direction === 'up' && 'text-emerald-600 dark:text-emerald-400',
              trend.direction === 'down' && 'text-rose-600 dark:text-rose-400',
              trend.direction === 'neutral' && 'text-slate-500 dark:text-slate-400'
            )}
          >
            {trend.direction === 'up' && '↑ '}
            {trend.direction === 'down' && '↓ '}
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
