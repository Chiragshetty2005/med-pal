import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';

export default function DigitalTwin({ history }) {
  if (!history || history.length === 0) return null;

  const lastResult = history[0]; // Most recent
  const isEmergency = lastResult.Severity === 'Emergency';
  const isWarning = lastResult.Severity === 'Warning';
  
  const scoreColor = isEmergency ? 'text-red-400' 
                   : isWarning ? 'text-yellow-400' 
                   : 'text-green-400';

  const barColor = isEmergency ? 'bg-red-500' 
                 : isWarning ? 'bg-yellow-500' 
                 : 'bg-green-500';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 w-80 glass-panel p-5 z-50 hidden md:block"
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Digital Twin
        </h3>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> 
          {new Date(lastResult.Timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
             <span className="text-gray-400">Risk Level</span>
             <span className={`font-bold ${scoreColor}`}>{lastResult.RiskScore}/100</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${lastResult.RiskScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${barColor}`}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1">Primary Condition</span>
          <p className="text-sm text-gray-200 truncate">
            {lastResult.PossibleConditions?.[0] || 'Unknown'}
          </p>
        </div>
        
        {isEmergency && (
          <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20 text-center animate-pulse">
            High Risk State Detected
          </div>
        )}
      </div>
    </motion.div>
  );
}
