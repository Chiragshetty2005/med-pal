import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, HeartPulse } from 'lucide-react';

export default function Results({ result, onReset }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animated counter for risk score
    let start = 0;
    const end = result.RiskScore || 0;
    if (start === end) return;
    
    let timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) clearInterval(timer);
    }, 20); // ms per frame

    return () => clearInterval(timer);
  }, [result.RiskScore]);

  const isEmergency = result.Severity === 'Emergency';
  const isWarning = result.Severity === 'Warning';
  
  const glowClass = isEmergency ? 'glow-red border-red-500/50' 
                  : isWarning ? 'glow-yellow border-yellow-500/50' 
                  : 'glow-green border-green-500/50';

  const textClass = isEmergency ? 'text-red-400' 
                  : isWarning ? 'text-yellow-400' 
                  : 'text-green-400';

  const Icon = isEmergency ? AlertTriangle : isWarning ? Info : CheckCircle;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative p-8 rounded-3xl bg-black/40 backdrop-blur-2xl border ${glowClass} max-w-4xl mx-auto overflow-hidden`}
    >
      {/* Background radial gradient based on severity */}
      <div className={`absolute top-0 right-0 w-96 h-96 -mr-20 -mt-20 rounded-full blur-[100px] opacity-20 pointer-events-none
        ${isEmergency ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}
      `} />

      <div className="flex flex-col md:flex-row gap-8 relative z-10 w-full">
        
        {/* Left Column: Score & Status */}
        <div className="flex-1 flex flex-col justify-start items-center p-6 bg-white/5 rounded-2xl border border-white/10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            className={`w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4
              ${isEmergency ? 'border-red-500 text-red-500' : isWarning ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}
            `}
          >
            <span className="text-5xl font-bold">{displayScore}</span>
          </motion.div>
          
          <h2 className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-1">Risk Score</h2>
          
          <div className={`flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 ${textClass}`}>
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{result.Severity}</span>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 w-full border-t border-white/10 pt-6">
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Classified Domain</h3>
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
              <span className="text-indigo-300 font-medium">{result.PrimaryDomain}</span>
              <span className="text-indigo-400/70 text-sm font-mono">{result.DomainConfidence}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-[2] space-y-6">
          {isEmergency && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex items-start gap-4 animate-pulse"
            >
              <AlertTriangle className="text-red-400 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-bold mb-1">EMERGENCY ALERT</h3>
                <p className="text-red-200 text-sm">Immediate medical attention is recommended based on the synthesized vital logic.</p>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-xl block"
          >
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
               AI Diagnostic Reasoning
            </h3>
            <p className="text-indigo-200/80 leading-relaxed text-sm">
              {result.Explanation}
            </p>
            
            <div className="mt-4 pt-4 border-t border-indigo-500/10 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-indigo-400/60 uppercase tracking-wider mb-2">Symptomatic Evidence</h4>
                <ul className="list-disc pl-4 text-xs text-indigo-200/70 space-y-1">
                  {result.SupportingEvidence?.Symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-xs text-indigo-400/60 uppercase tracking-wider mb-2">Vital Correlates</h4>
                <ul className="list-disc pl-4 text-xs text-indigo-200/70 space-y-1">
                  {result.SupportingEvidence?.Vitals?.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-indigo-400" /> Possible Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.PossibleConditions?.map((cond, idx) => (
                <span key={idx} className="bg-white/10 text-gray-200 px-4 py-2 rounded-lg text-sm border border-white/5">
                  {cond}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" /> Recommended Actions
            </h3>
            <ul className="space-y-2">
              {result.Recommendations?.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                  <span className="text-indigo-400 font-bold">{idx + 1}.</span> {rec}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onReset}
        className="mt-8 mx-auto flex items-center justify-center px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-all"
      >
        Start New Assessment
      </motion.button>
    </motion.div>
  );
}
