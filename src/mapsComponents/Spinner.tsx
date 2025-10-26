import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const Spinner: React.FC = () => {
  const messages = [
    "Finding the best lawyers near you...",
    "Analyzing nearby legal data...",
    "Matching specialties to your needs...",
    "Almost ready! Preparing your results...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="absolute h-16 w-16 border-4 border-indigo-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <motion.div
          className="absolute h-10 w-10 border-4 border-indigo-400 rounded-full border-t-transparent"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <Loader2 className="h-8 w-8 text-indigo-600 animate-pulse" />
      </motion.div>

      {/* Animated Text */}
      <div className="relative h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-lg font-medium text-slate-700 dark:text-slate-300 text-center"
          >
            {messages[currentMessageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        className="flex space-x-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 bg-indigo-500 rounded-full"
            variants={{
              hidden: { opacity: 0.2, y: 0 },
              visible: {
                opacity: [0.2, 1, 0.2],
                y: [0, -6, 0],
                transition: { repeat: Infinity, duration: 1.2, delay: i * 0.2 },
              },
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Spinner;