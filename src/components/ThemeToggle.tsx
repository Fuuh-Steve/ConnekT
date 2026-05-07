'use client';
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center",
        theme === 'dark' ? "bg-white/10" : "bg-black/5"
      )}
    >
      <motion.div
        animate={{ x: theme === 'dark' ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
          theme === 'dark' ? "bg-[rgb(var(--accent))] text-black" : "bg-white text-gray-600"
        )}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </motion.div>
    </button>
  );
};
