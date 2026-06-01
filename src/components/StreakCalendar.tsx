import React from 'react';
import { motion } from 'motion/react';
import { Check, Flame } from 'lucide-react';

interface StreakCalendarProps {
  streak: number;
  streakHistory?: string[]; // Array of YYYY-MM-DD
  animateIncrement?: boolean;
}

export default function StreakCalendar({ streak, streakHistory = [], animateIncrement = false }: StreakCalendarProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isDayMatch = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return streakHistory.includes(dateStr);
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today);

  return (
    <motion.div 
      animate={animateIncrement ? {
        scale: [1, 1.05, 0.98, 1.02, 1],
        boxShadow: [
          "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
          "0 0 35px 12px rgba(249, 115, 22, 0.5)",
          "0 0 50px 18px rgba(249, 115, 22, 0.15)",
          "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)"
        ]
      } : {}}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div 
            key={`flame-${streak}`}
            initial={{ scale: 1, rotate: 0 }}
            animate={{ 
              scale: [1, 1.4, 1.2, 1], 
              rotate: [0, -15, 15, -10, 10, 0] 
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm"
          >
            <Flame size={20} fill="currentColor" />
          </motion.div>
          <div>
            <motion.h3 
              key={`text-${streak}`}
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 1.25, 1.15, 1],
                color: ["#ea580c", "#c2410c", "#9a3412", "inherit"]
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-extrabold text-on-surface leading-tight text-lg"
            >
              {streak} Day Streak
            </motion.h3>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Keep the fire burning!</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-[#1b366a] uppercase tracking-tighter">{monthName} {currentYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[9px] font-black text-on-surface-variant/40">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blanks.map(b => (
          <div key={`blank-${b}`} className="aspect-square" />
        ))}
        {days.map(d => {
          const active = isDayMatch(d);
          const isToday = d === today.getDate();
          
          return (
            <div 
              key={d} 
              className={`aspect-square rounded-xl flex items-center justify-center relative group transition-all duration-300 ${
                active 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : isToday 
                    ? 'bg-surface-container border border-primary/20 text-primary' 
                    : 'bg-surface-container/30 text-on-surface-variant/40'
              }`}
            >
              <span className={`text-[10px] font-black ${active ? 'hidden' : ''}`}>{d}</span>
              {active && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                >
                  <Check size={12} strokeWidth={4} />
                </motion.div>
              )}
              {isToday && !active && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-outline-variant flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
             <div key={i} className={`w-1.5 h-6 rounded-full ${i < (streak % 7 || (streak > 0 ? 7 : 0)) ? 'bg-orange-500' : 'bg-surface-container'}`} />
          ))}
        </div>
        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
           {7 - (streak % 7 || (streak > 0 ? 7 : 0))} days to next tier
        </p>
      </div>
    </motion.div>
  );
}
