import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import './theme-toggle.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="theme-toggle-container">
      <input
        type="checkbox"
        className="theme-switch"
        checked={isDark}
        onChange={handleToggle}
        aria-label="Toggle theme"
      />
    </div>
  );
}