import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Load saved theme or default to light
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="theme-toggle-container">
      <label htmlFor="themeToggle" className="sr-only">
        Toggle dark mode
      </label>
      <input
        id="themeToggle"
        type="checkbox"
        checked={theme === 'dark'}
        onChange={toggleTheme}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label="Toggle dark mode"
        tabIndex={0}
        className="theme-toggle-checkbox"
      />
      <span className="theme-toggle-label" aria-hidden="true">
        {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </span>
    </div>
  );
};

export default ThemeToggle;