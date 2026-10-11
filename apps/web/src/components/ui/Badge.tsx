import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-800 text-gray-200 border-gray-700',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  danger: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
