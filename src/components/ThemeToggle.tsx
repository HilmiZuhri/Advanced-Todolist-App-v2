/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ darkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-250 cursor-pointer"
      aria-label="Toggle theme"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun id="sun-icon" className="w-5 h-5 text-amber-500 transition-all duration-300" />
      ) : (
        <Moon id="moon-icon" className="w-5 h-5 text-indigo-600 transition-all duration-300" />
      )}
    </button>
  );
}
