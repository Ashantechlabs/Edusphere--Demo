'use client';

import React, { createContext, useContext } from 'react';

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, children, className = '', ...props }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList = ({ children, className = '', ...props }: TabsListProps) => {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger = ({ value, children, className = '', ...props }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? "bg-card text-card-foreground shadow-xs"
          : "hover:bg-slate-50/50 hover:text-slate-900 dark:hover:bg-slate-900/50 dark:hover:text-slate-100"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent = ({ value, children, className = '', ...props }: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const isActive = context.value === value;

  if (!isActive) return null;

  return (
    <div
      className={`mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
