import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isProcessing?: boolean;
  confirmText?: string;
  confirmColor?: string; // e.g. "bg-red-600 hover:bg-red-700 shadow-red-900/20"
  icon?: string;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isProcessing = false,
  confirmText = 'Confirm',
  confirmColor = 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20',
  icon = 'warning'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </div>
              <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {message}
              </p>
            </div>
            <div className="p-4 bg-surface-container flex gap-3">
              <button 
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-surface-variant transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={isProcessing}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${confirmColor}`}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
