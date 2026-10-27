import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/lib/theme';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-ink hover:text-accent transition-colors rounded-ui focus-visible:ring-1 focus-visible:ring-accent ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
