import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantProps {
  questionTitle: string;
  options: { id: string; text: string }[];
  studentAnswerId: string | null;
  correctAnswerId: string;
}

export default function AIAssistant({ questionTitle, options, studentAnswerId, correctAnswerId }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const getExplanation = async () => {
    setLoading(true);
    setShow(true);
    try {
      const res = await fetch('/api/explain-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionTitle, options, studentAnswerId, correctAnswerId })
      });
      const data = await res.json();
      if (data.success) {
        setExplanation(data.explanation);
      } else {
        setExplanation("I'm sorry, I'm having trouble analyzing this question right now.");
      }
    } catch (e) {
      setExplanation("Unable to connect to the AI service. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!show ? (
        <button 
          onClick={getExplanation}
          className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <Sparkles size={14} />
          Ask Study Assistant
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 rounded-2xl p-4 border border-primary/10 relative"
        >
          <button 
            onClick={() => { setShow(false); setExplanation(null); }}
            className="absolute top-2 right-2 p-1 text-primary/40 hover:text-primary"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
            <Sparkles size={12} />
            AI Explanation
          </div>
          {loading ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <p className="text-xs text-on-surface-variant/40 font-medium italic">Analyzing pedagogical context...</p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {explanation}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
