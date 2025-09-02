import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 h-full min-h-[320px] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 opacity-60"
        initial={{ background: 'radial-gradient(600px circle at 0% 0%, #93c5fd 0, transparent 60%)' }}
        animate={{
          background: [
            'radial-gradient(600px circle at 0% 0%, #93c5fd 0, transparent 60%)',
            'radial-gradient(600px circle at 100% 0%, #a5b4fc 0, transparent 60%)',
            'radial-gradient(600px circle at 100% 100%, #93c5fd 0, transparent 60%)',
            'radial-gradient(600px circle at 0% 100%, #a5b4fc 0, transparent 60%)',
            'radial-gradient(600px circle at 0% 0%, #93c5fd 0, transparent 60%)',
          ],
        }}
        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
      />

      <div className="relative z-10 text-center p-8">
        <motion.div
          className="w-14 h-14 mx-auto mb-6 rounded-full border-4 border-blue-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your document</h3>
        <p className="text-gray-600">{message || 'This should only take a few moments...'}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;


