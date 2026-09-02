'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoading(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(30);
      const timer1 = setTimeout(() => setProgress(60), 200);
      const timer2 = setTimeout(() => setProgress(85), 400);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    window.addEventListener('beforeunload', handleStart);
    window.addEventListener('load', handleComplete);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleComplete);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleLinkClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a');
        if (target && target.href && !target.href.startsWith('javascript:')) {
          const isInternal = target.href.startsWith(window.location.origin);
          if (isInternal && !e.ctrlKey && !e.metaKey) {
            setIsLoading(true);
            setProgress(20);
            setTimeout(() => setProgress(50), 200);
            setTimeout(() => setProgress(70), 400);
          }
        }
      };

      document.addEventListener('click', handleLinkClick);
      return () => document.removeEventListener('click', handleLinkClick);
    }
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="h-1 bg-gray-200/20 backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-r-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}