import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const messages = [
    "Analyzing clauses...",
    "Checking compliance terms...",
    "Extracting key sections...",
    "Simplifying legal jargon...",
    "Summarizing document insights..."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // change every 2.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 h-full min-h-[320px] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ background: 'radial-gradient(600px circle at 0% 0%, hsl(var(--primary) / 0.3) 0, transparent 60%)' }}
        animate={{
          background: [
            'radial-gradient(600px circle at 0% 0%, hsl(var(--primary) / 0.3) 0, transparent 60%)',
            'radial-gradient(600px circle at 100% 0%, hsl(var(--secondary) / 0.3) 0, transparent 60%)',
            'radial-gradient(600px circle at 100% 100%, hsl(var(--primary) / 0.3) 0, transparent 60%)',
            'radial-gradient(600px circle at 0% 100%, hsl(var(--secondary) / 0.3) 0, transparent 60%)',
            'radial-gradient(600px circle at 0% 0%, hsl(var(--primary) / 0.3) 0, transparent 60%)',
          ],
        }}
        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
      />

      <div className="relative z-10 text-center p-8">
        <motion.div
          className="w-14 h-14 mx-auto mb-6 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Analyzing your document
        </h3>

        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {message || messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoadingScreen;
