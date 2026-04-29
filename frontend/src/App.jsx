import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Hero from './components/Hero';
import ConversationalFlow from './components/ConversationalFlow';
import LoaderState from './components/LoaderState';
import Results from './components/Results';
import DigitalTwin from './components/DigitalTwin';
import AlertOverlay from './components/AlertOverlay';
import VoiceInterface from './components/aira/VoiceInterface';
import ImageUpload from './components/ImageUpload';
import ImageResult from './components/ImageResult';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { analyzePatientData } from './services/api';
import { analyzeImage } from './services/imageApi';
import { useAuth } from './context/authContext';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import './index.css';

export default function App() {
  const [appState, setAppState] = useState('HERO'); // HERO, INPUT, AIRA, LOADING, RESULTS, SCAN, SCAN_LOADING, SCAN_RESULTS, AUTH, DASHBOARD
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Image scan state
  const [scanResult, setScanResult] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Auth context
  const { user, token, isAuthenticated, logout, loading: authLoading } = useAuth();

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

  const handleAira = () => {
    setAppState('AIRA');
  };

  const handleScan = () => {
    setAppState('SCAN');
    setScanResult(null);
    setScanPreview(null);
    setScanLoading(false);
  };

  const handleAuth = () => {
    setAppState('AUTH');
  };

  const handleDashboard = () => {
    setAppState('DASHBOARD');
  };

  const handleAuthSuccess = () => {
    setAppState('HERO');
  };

  const handleLogout = () => {
    logout();
    setAppState('HERO');
  };

  const handleScanAnalyze = async (file, scanType) => {
    setScanLoading(true);
    setError(null);

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (e) => setScanPreview(e.target.result);
    reader.readAsDataURL(file);

    try {
      const data = await analyzeImage(file, scanType, token);
      setScanResult(data);

      // Artificial delay for loader feel
      setTimeout(() => {
        setScanLoading(false);
        setAppState('SCAN_RESULTS');

        // Trigger existing alert for high severity
        if (data.severity === 'High') {
          setShowAlert(true);
        }
      }, 3000);
    } catch (err) {
      console.error('Scan analysis failed:', err);
      setError('Scan analysis failed. Please try again.');
      setScanLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setAppState('LOADING');
    setError(null);
    try {
      const data = await analyzePatientData(formData, token);
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
    setScanResult(null);
    setScanPreview(null);
    setScanLoading(false);
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
      <header className="fixed top-0 w-full p-6 z-40 flex justify-between items-center">
        <h1
          className="text-xl font-bold tracking-widest text-white/90 cursor-pointer"
          onClick={handleReset}
        >
          MED_PAL<span className="text-indigo-500">_</span>
        </h1>
        <div className="flex gap-3 items-center">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
           <span className="text-xs text-indigo-400 tracking-widest font-mono uppercase hidden sm:inline">System Active</span>
           
           {/* Auth buttons */}
           {!authLoading && (
             <>
               {isAuthenticated ? (
                 <div className="flex items-center gap-2 ml-4">
                   <button
                     id="header-dashboard-btn"
                     onClick={handleDashboard}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all text-xs"
                   >
                     <LayoutDashboard className="w-3 h-3" />
                     <span className="hidden sm:inline">Reports</span>
                   </button>
                   <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                     <span>{user?.name?.split(' ')[0]}</span>
                     <span className="text-indigo-500/50">•</span>
                     <span className="capitalize text-indigo-400/60">{user?.role}</span>
                   </div>
                   <button
                     id="header-logout-btn"
                     onClick={handleLogout}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all text-xs"
                   >
                     <LogOut className="w-3 h-3" />
                     <span className="hidden sm:inline">Logout</span>
                   </button>
                 </div>
               ) : (
                 <button
                   id="header-login-btn"
                   onClick={handleAuth}
                   className="flex items-center gap-1.5 ml-4 px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-xs font-medium"
                 >
                   <LogIn className="w-3 h-3" />
                   Sign In
                 </button>
               )}
             </>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col justify-center">
        
        {error && (appState === 'INPUT' || appState === 'SCAN') && (
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
              <Hero onStart={handleStart} onAira={handleAira} onScan={handleScan} onDashboard={handleDashboard} isLoggedIn={isAuthenticated} />
            </motion.div>
          )}

          {appState === 'AUTH' && (
            <motion.div key="auth" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <AuthScreen onSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {appState === 'DASHBOARD' && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <Dashboard onBack={handleReset} />
            </motion.div>
          )}

          {appState === 'INPUT' && (
            <motion.div key="input" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <ConversationalFlow onSubmit={handleSubmit} />
            </motion.div>
          )}

          {appState === 'AIRA' && (
            <motion.div key="aira" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <VoiceInterface onSubmit={handleSubmit} onReset={handleReset} />
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

          {appState === 'SCAN' && (
            <motion.div key="scan" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <ImageUpload onAnalyze={handleScanAnalyze} isLoading={scanLoading} />
            </motion.div>
          )}

          {appState === 'SCAN_LOADING' && (
            <motion.div key="scan-loading" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <LoaderState />
            </motion.div>
          )}

          {appState === 'SCAN_RESULTS' && scanResult && (
            <motion.div key="scan-results" variants={pageVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.5 }}>
              <ImageResult result={scanResult} imagePreview={scanPreview} onReset={handleReset} />
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

      {/* High Risk Alert Overlay — handles both patient analysis and scan results */}
      <AnimatePresence>
        {showAlert && (result || scanResult) && (
          <AlertOverlay isVisible={showAlert} onClose={() => setShowAlert(false)}>
            <div className="space-y-2">
              {scanResult ? (
                <>
                  <p><span className="text-red-400 font-bold">Scan Type:</span> {scanResult.type}</p>
                  <p><span className="text-red-400 font-bold">Finding:</span> {scanResult.prediction}</p>
                  <p><span className="text-red-400 font-bold">Confidence:</span> {(scanResult.confidence * 100).toFixed(1)}%</p>
                  <p><span className="text-red-400 font-bold">Severity:</span> {scanResult.severity}</p>
                </>
              ) : (
                <>
                  <p><span className="text-red-400 font-bold">Severity:</span> {result.Severity}</p>
                  <p><span className="text-red-400 font-bold">Risk Score:</span> {result.RiskScore}/100</p>
                  <p><span className="text-red-400 font-bold">Primary Finding:</span> {result.PossibleConditions?.[0] || 'Unknown'}</p>
                </>
              )}
            </div>
          </AlertOverlay>
        )}
      </AnimatePresence>

    </div>
  );
}
