import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileDigit, ShieldAlert } from 'lucide-react';

const loadingMessages = [
  { text: "Connecting to medial core...", icon: Brain },
  { text: "Analyzing symptoms & vitals...", icon: FileDigit },
  { text: "Evaluating risk profile...", icon: ShieldAlert },
  { text: "Synthesizing AI diagnosis...", icon: Brain }
];

export default function Loader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = loadingMessages[index].icon;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-12">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-40 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-b-2 border-r-2 border-indigo-400 flex items-center justify-center relative z-10"
        >
          <CurrentIcon className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      <motion.p
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-2xl font-light text-gray-300 tracking-wide"
      >
        {loadingMessages[index].text}
      </motion.p>
      
      <div className="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.8, ease: "linear" }}
        />
      </div>
    </div>
  );
}
