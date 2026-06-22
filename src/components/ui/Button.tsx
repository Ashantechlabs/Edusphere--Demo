import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-indigo-700 shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-slate-200 dark:hover:bg-slate-800 border border-border",
      outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground text-slate-700 dark:text-slate-200",
      destructive: "bg-destructive text-destructive-foreground hover:bg-red-600 shadow-sm",
      ghost: "hover:bg-accent hover:text-accent-foreground text-slate-700 dark:text-slate-300",
      link: "text-primary underline-offset-4 hover:underline bg-transparent p-0"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-8 text-base",
      icon: "h-10 w-10"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
