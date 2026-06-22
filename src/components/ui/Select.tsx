import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, value, onChange, label, ...props }, ref) => {
    return (
      <div className="relative w-full flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full appearance-none rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 pr-10 cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-card-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
