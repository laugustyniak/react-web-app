import React from 'react';
import { cn } from '~/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function PageLayout({ children, className, fullHeight = true }: LayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full mx-auto',
        fullHeight ? 'min-h-[calc(100vh-64px)]' : '', // Adjust for header height
        'px-3 sm:px-4 md:px-6 lg:px-8', // Improved responsive padding
        'max-w-7xl', // Maximum width constraint
        'py-4 sm:py-6 md:py-8 lg:py-12', // Improved responsive vertical padding
        className
      )}
    >
      <div className="flex-grow flex flex-col items-center justify-center w-full">{children}</div>
    </div>
  );
}

export function ContentCard({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto', // Constrain width for better readability
        'bg-white dark:bg-gray-800',
        'rounded-lg shadow-sm',
        'p-4 sm:p-6', // Responsive padding
        'transition-all duration-200', // Smooth transitions
        className
      )}
    >
      {children}
    </div>
  );
}
