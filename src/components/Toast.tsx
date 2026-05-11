import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

export default function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            type === 'success' 
              ? 'bg-slate-900 text-white border-slate-800' 
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-sm font-bold tracking-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
