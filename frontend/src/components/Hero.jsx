import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Mic, ScanLine, LayoutDashboard } from 'lucide-react';

export default function Hero({ onStart, onAira, onScan, onDashboard, isLoggedIn }) {
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

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Existing — Start Analysis */}
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

        {/* Existing — Talk to Dr. AIRA */}
        <motion.button
          id="aira-hero-cta"
          onClick={onAira}
          className="group relative px-8 py-4 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/40 hover:border-violet-400/70 rounded-full text-violet-200 font-medium tracking-wide transition-all overflow-hidden shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Mic className="w-4 h-4 group-hover:text-violet-300" />
            Talk to Dr. AIRA
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Animated border shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0%, rgba(139,92,246,0.25) 50%, transparent 100%)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </motion.button>

        {/* NEW — Scan Analysis */}
        <motion.button
          id="scan-hero-cta"
          onClick={onScan}
          className="group relative px-8 py-4 bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/40 hover:border-cyan-400/70 rounded-full text-cyan-200 font-medium tracking-wide transition-all overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <ScanLine className="w-4 h-4 group-hover:text-cyan-300" />
            Scan Analysis
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Animated border shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 180deg, transparent 0%, rgba(34,211,238,0.25) 50%, transparent 100%)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.button>
      </div>

      {/* Dashboard link — only visible when logged in */}
      {isLoggedIn && (
        <motion.button
          onClick={onDashboard}
          className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <LayoutDashboard className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
          View Dashboard & Reports
        </motion.button>
      )}
    </motion.div>
  );
}
