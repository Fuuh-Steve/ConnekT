'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Zap } from 'lucide-react';

interface SplashLoaderProps {
  onComplete: () => void;
}

export const SplashLoader = ({ onComplete }: SplashLoaderProps) => {
  const [stage, setStage] = useState<'welcome' | 'bienvenue' | 'exit'>('welcome');

  useEffect(() => {
    // Stage 1: Welcome (English) for 1.3 seconds
    const timer1 = setTimeout(() => {
      setStage('bienvenue');
    }, 1300);

    // Stage 2: Bienvenue (French) for 1.3 seconds
    const timer2 = setTimeout(() => {
      setStage('exit');
    }, 2600);

    // Complete the splash and call onComplete
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  // Split words for character-by-character animation
  const englishWords = "Welcome".split("");
  const frenchWords = "Bienvenue".split("");

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const letterVariants: Variants = {
    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
    animate: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 100
      } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      filter: "blur(4px)",
      transition: { duration: 0.25 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[rgb(var(--bg-main))] overflow-hidden select-none"
    >
      {/* Decorative premium gradient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] bg-[rgb(var(--accent))]/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[80px]"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Glowing Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            rotate: 0,
            transition: { type: "spring", stiffness: 150, damping: 15 }
          }}
          className="relative"
        >
          {/* Logo outer ring animation */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 blur-md opacity-50 scale-115 animate-pulse"></div>
          
          <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-blue-600 flex items-center justify-center shadow-2xl shadow-[rgb(var(--accent))]/40">
            <Zap className="w-9 h-9 text-white fill-white/10" />
          </div>
        </motion.div>

        {/* Text Container with AnimatePresence */}
        <div className="h-16 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {stage === 'welcome' && (
              <motion.div
                key="welcome-en"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex text-4xl md:text-5xl font-extrabold tracking-[0.2em] text-[rgb(var(--text-main))]"
              >
                {englishWords.map((char, index) => (
                  <motion.span key={index} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {stage === 'bienvenue' && (
              <motion.div
                key="welcome-fr"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex text-4xl md:text-5xl font-extrabold tracking-[0.15em] text-[rgb(var(--text-main))]"
              >
                {frenchWords.map((char, index) => (
                  <motion.span key={index} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle high-tech loading line */}
        <div className="w-48 h-[2px] bg-[rgb(var(--border))]/30 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2.6, 
              ease: "easeInOut",
              repeat: 0
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-[rgb(var(--accent))] to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};
