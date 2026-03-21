import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <motion.div 
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-30 rounded-full" />
        <Activity className="w-24 h-24 text-indigo-400 relative z-10 mx-auto" strokeWidth={1.5} />
      </motion.div>

      <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Your Health. <br />
        <span className="text-gradient">Understood by AI.</span>
      </motion.h1>

      <motion.p 
        className="text-xl text-gray-400 max-w-2xl mb-12 font-light"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        Experience real-time, precision health analysis driven by advanced digital twin technology.
      </motion.p>

      <motion.button
        onClick={onStart}
        className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium tracking-wide transition-all overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative z-10 flex items-center gap-2">
          Start Analysis
          <Activity className="w-4 h-4 group-hover:animate-pulse" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </motion.div>
  );
}
