import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, Info, Shield, 
  ArrowRight, Scan, RotateCcw, Brain 
} from 'lucide-react';

export default function ImageResult({ result, imagePreview, onReset }) {
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const targetConfidence = Math.round((result.confidence || 0) * 100);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayConfidence(current);
      if (current >= targetConfidence) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [targetConfidence]);

  const severity = (result.severity || 'Low').toLowerCase();
  const isHigh = severity === 'high';
  const isMedium = severity === 'medium';

  const severityConfig = {
    high: {
      glow: 'glow-red border-red-500/40',
      text: 'text-red-400',
      bg: 'bg-red-500',
      bgLight: 'bg-red-500/10',
      border: 'border-red-500/30',
      gradient: 'from-red-600 to-rose-600',
      Icon: AlertTriangle,
      label: 'High Risk',
    },
    medium: {
      glow: 'glow-yellow border-yellow-500/40',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      gradient: 'from-yellow-600 to-amber-600',
      Icon: Info,
      label: 'Medium Risk',
    },
    low: {
      glow: 'glow-green border-green-500/40',
      text: 'text-green-400',
      bg: 'bg-green-500',
      bgLight: 'bg-green-500/10',
      border: 'border-green-500/30',
      gradient: 'from-green-600 to-emerald-600',
      Icon: CheckCircle,
      label: 'Low Risk',
    },
  };

  const config = severityConfig[severity] || severityConfig.low;
  const SeverityIcon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`relative max-w-5xl mx-auto rounded-3xl bg-black/40 backdrop-blur-2xl border ${config.glow} overflow-hidden`}
    >
      {/* Background radial glow */}
      <div className={`absolute top-0 right-0 w-96 h-96 -mr-20 -mt-20 rounded-full blur-[120px] opacity-15 pointer-events-none ${config.bg}`} />

      {/* Header Badge */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgLight} ${config.border} border flex items-center justify-center`}>
            <Scan className={`w-5 h-5 ${config.text}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Scan Analysis Complete</h2>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{result.type || 'Medical Scan'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgLight} border ${config.border}`}>
          <SeverityIcon className={`w-4 h-4 ${config.text}`} />
          <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left — Image + Confidence */}
          <div className="lg:w-[340px] flex-shrink-0 space-y-5">
            {/* Image Preview */}
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/10"
              >
                <img
                  src={imagePreview}
                  alt="Analyzed scan"
                  className="w-full h-[220px] object-contain p-3"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-16 pointer-events-none" />
              </motion.div>
            )}

            {/* Prediction Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-5"
            >
              <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">Prediction</h3>
              <p className={`text-lg font-bold ${config.text}`}>{result.prediction}</p>
            </motion.div>

            {/* Confidence Meter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Confidence</h3>
                <span className={`text-2xl font-bold ${config.text}`}>{displayConfidence}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${targetConfidence}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}
                />
              </div>
            </motion.div>
          </div>

          {/* Right — Explanation + Actions */}
          <div className="flex-1 space-y-5">
            {/* High Severity Alert Banner */}
            {isHigh && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-red-500/15 border border-red-500/40 p-4 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle className="text-red-400 w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-bold text-sm mb-1">URGENT ATTENTION REQUIRED</h3>
                  <p className="text-red-200/80 text-xs">This finding requires prompt medical evaluation. Please consult a healthcare provider.</p>
                </div>
              </motion.div>
            )}

            {/* AI Explanation — Dr. AIRA Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <Brain className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Dr. AIRA Analysis</h3>
                  <p className="text-[10px] text-indigo-400/60 font-mono uppercase tracking-wider">AI Radiology Intelligence Assistant</p>
                </div>
              </div>
              <p className="text-indigo-100/80 leading-relaxed text-sm">
                {result.explanation || 'No explanation available.'}
              </p>
            </motion.div>

            {/* Next Steps */}
            {result.next_steps && result.next_steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Recommended Next Steps
                </h3>
                <div className="space-y-2">
                  {result.next_steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className="flex items-start gap-3 bg-white/[0.03] border border-white/5 p-3.5 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-cyan-400">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-300">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={onReset}
            id="scan-new-image-btn"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Scan Another Image
          </button>
          <button
            onClick={onReset}
            id="back-to-home-btn"
            className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
