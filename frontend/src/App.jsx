import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Hero from './components/Hero';
import ConversationalFlow from './components/ConversationalFlow';
import LoaderState from './components/LoaderState';
import Results from './components/Results';
import DigitalTwin from './components/DigitalTwin';
import AlertOverlay from './components/AlertOverlay';
import { analyzePatientData } from './services/api';
import './index.css';

export default function App() {
  const [appState, setAppState] = useState('HERO'); // HERO, INPUT, LOADING, RESULTS
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Load digital twin history on mount
  useEffect(() => {
    const saved = localStorage.getItem('medpal_twin_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleStart = () => {
    setAppState('INPUT');
  };

  const handleSubmit = async (formData) => {
    setAppState('LOADING');
    setError(null);
    try {
      const data = await analyzePatientData(formData);
      setResult(data);

      const newHistory = [data, ...history].slice(0, 5); // Keep last 5 for Digital Twin
      setHistory(newHistory);
      localStorage.setItem('medpal_twin_history', JSON.stringify(newHistory));

      // Check high risk
      const isHighRisk = data.Severity === 'Emergency' || data.Severity === 'High';
      
      // Wait for loader animation to feel complete (approx 4 seconds based on LoaderState phases)
      setTimeout(() => {
        setAppState('RESULTS');
        if (isHighRisk) {
          setShowAlert(true);
        }
      }, 4000);

    } catch (err) {
      setError('Analysis failed. Secure connection interrupted.');
      setAppState('INPUT');
    }
  };

  const handleReset = () => {
    setResult(null);
    setShowAlert(false);
    setAppState('HERO');
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  };

  return (
    <div className="relative min-h-screen">
      {/* Universal header */}
      <header className="fixed top-0 w-full p-6 z-40 flex justify-between items-center pointer-events-none">
        <h1 className="text-xl font-bold tracking-widest text-white/90">MED_PAL<span className="text-indigo-500">_</span></h1>
        <div className="flex gap-2 items-center">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
           <span className="text-xs text-indigo-400 tracking-widest font-mono uppercase">System Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col justify-center">
        
        {error && appState === 'INPUT' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-xl z-50 backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {appState === 'HERO' && (
            <motion.div key="hero" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <Hero onStart={handleStart} />
            </motion.div>
          )}

          {appState === 'INPUT' && (
            <motion.div key="input" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <ConversationalFlow onSubmit={handleSubmit} />
            </motion.div>
          )}

          {appState === 'LOADING' && (
            <motion.div key="loading" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <LoaderState />
            </motion.div>
          )}

          {appState === 'RESULTS' && result && (
            <motion.div key="results" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <Results result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Persistent Digital Twin Overlay */}
      <AnimatePresence>
        {history.length > 0 && appState !== 'LOADING' && (
          <DigitalTwin history={history} />
        )}
      </AnimatePresence>

      {/* High Risk Alert Overlay */}
      <AnimatePresence>
        {showAlert && result && (
          <AlertOverlay isVisible={showAlert} onClose={() => setShowAlert(false)}>
            <div className="space-y-2">
              <p><span className="text-red-400 font-bold">Severity:</span> {result.Severity}</p>
              <p><span className="text-red-400 font-bold">Risk Score:</span> {result.RiskScore}/100</p>
              <p><span className="text-red-400 font-bold">Primary Finding:</span> {result.PossibleConditions?.[0] || 'Unknown'}</p>
            </div>
          </AlertOverlay>
        )}
      </AnimatePresence>

    </div>
  );
}
