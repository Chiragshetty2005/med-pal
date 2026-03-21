import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function AlertOverlay({ isVisible, onClose, children }) {
  
  useEffect(() => {
    if (isVisible) {
      // Play alert sound according to prompt constraints
      const audio = new Audio('/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.log("Audio playback requires user interaction or file not configured:", err.message);
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      {/* Background pulsing red gradient mesh */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-red-600 blur-[150px] opacity-60 mix-blend-screen pointer-events-none"
      />
      
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative max-w-2xl w-full bg-red-950/40 border-2 border-red-500/50 rounded-3xl p-8 glow-red overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-400 mb-6"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 animate-pulse" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            High Risk Detected
          </h1>
          <p className="text-xl text-red-200 font-light mb-8 uppercase tracking-widest">
            Immediate attention recommended
          </p>
          
          <div className="w-full bg-black/30 p-6 rounded-2xl border border-red-500/20 text-left">
            {children}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-8 px-10 py-4 bg-white text-red-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Acknowledge & View Details
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
