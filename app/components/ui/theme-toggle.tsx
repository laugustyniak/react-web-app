import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '~/contexts/ThemeContext';
import { cn } from '~/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
}

export function ThemeToggle({ className, variant = 'ghost' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={cn('rounded-full cursor-pointer', className)}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun
        className={cn(
          'h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all',
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        )}
      />
      <Moon
        className={cn(
          'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all',
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'opacity-0'
        )}
      />
    </Button>
  );
}
