import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  children?: React.ReactNode;
}

export const Badge = ({
  className = '',
  variant = 'secondary',
  children,
  ...props
}: BadgeProps) => {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    primary: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900",
    error: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900",
    info: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900"
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
