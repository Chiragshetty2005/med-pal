import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function StepInput({ 
  id, 
  question, 
  isActive, 
  isPast, 
  value, 
  children,
  onEnter 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  if (!isActive && !isPast) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ 
        opacity: isActive ? 1 : 0.4, 
        y: 0, 
        scale: isActive ? 1 : 0.95,
        filter: isActive ? 'blur(0px)' : 'blur(2px)'
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full max-w-2xl mx-auto my-12 transition-all duration-700 ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div className="flex flex-col items-start w-full">
        {/* AI Question */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
            <span className="text-sm font-mono">AI</span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-light tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {question}
          </h2>
        </motion.div>

        {/* User Input Area */}
        <div className="w-full pl-12 mt-2">
          {isActive ? (
            <div className="relative group">
              {children}
            </div>
          ) : (
            <div className="text-xl text-indigo-300 font-medium">
              {/* Display summary of Answer when past */}
              {String(value || "Skipped")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
