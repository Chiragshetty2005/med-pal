import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoaderState() {
  const phases = [
    { label: "Connecting to medial network...", progress: 30 },
    { label: "Parsing symptom profile...", progress: 55 },
    { label: "Cross-checking biological vitals...", progress: 80 },
    { label: "Synthesizing AI diagnosis...", progress: 95 }
  ];

  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < phases.length) {
        setPhaseIndex(current);
      } else {
        clearInterval(interval);
      }
    }, 900); // Transitions every ~0.9s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative">
      <motion.div 
        className="relative w-48 h-48 flex items-center justify-center mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Glowing aura */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500 blur-[80px] rounded-full opacity-50"
        />
        
        {/* Core pulsing circle */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border border-indigo-500/50 flex items-center justify-center relative z-10"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-t-2 border-r-2 border-indigo-400"
          />
          <div className="absolute w-12 h-12 bg-indigo-400/80 rounded-full blur-[10px] animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Text feedback */}
      <div className="h-8 relative w-full flex justify-center">
        {phases.map((phase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: phaseIndex === idx ? 1 : 0, 
              y: phaseIndex === idx ? 0 : -15 
            }}
            transition={{ duration: 0.4 }}
            className={`absolute text-xl font-light text-indigo-100 tracking-wide ${phaseIndex !== idx && 'pointer-events-none'}`}
          >
            {phase.label}
          </motion.div>
        ))}
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 h-[2px] bg-white/10 mt-12 overflow-hidden rounded-full">
        <motion.div 
          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${phases[phaseIndex].progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
