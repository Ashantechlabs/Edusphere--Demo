'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md'
}: DialogProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className={`relative w-full ${sizes[size]} rounded-lg border border-border bg-card text-card-foreground shadow-lg duration-200 animate-fade-in z-10 flex flex-col max-h-[90vh]`}>
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          
          <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        
        {footer && (
          <div className="flex items-center justify-end space-x-2 p-6 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
