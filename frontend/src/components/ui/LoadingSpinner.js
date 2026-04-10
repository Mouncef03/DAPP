import React from 'react';
import { motion } from 'framer-motion';
import { FaHorse } from 'react-icons/fa';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <div className="w-16 h-16 border-4 border-gray-700 border-t-amber-400 rounded-full"></div>
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <FaHorse className="text-amber-400 text-3xl mb-3" />
      </motion.div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;