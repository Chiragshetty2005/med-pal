import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImagePlus, Scan, Zap } from 'lucide-react';

const SCAN_TYPES = [
  { id: 'xray', label: 'X-Ray', desc: 'Chest / Bone', icon: '🩻' },
  { id: 'mri', label: 'MRI', desc: 'Brain / Spine', icon: '🧠' },
  { id: 'ct', label: 'CT Scan', desc: 'Lung / Abdomen', icon: '🫁' },
];

export default function ImageUpload({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanType, setScanType] = useState('xray');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a JPEG or PNG image.');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (file && !isLoading) {
      onAnalyze(file, scanType);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Title Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
          <Scan className="w-3.5 h-3.5" />
          Medical Image Analysis
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Medical Scan</span>
        </h2>
        <p className="text-gray-400 font-light max-w-lg mx-auto">
          AI-powered analysis of X-rays, MRI, and CT scans with instant explanations
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column — Upload Zone */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !preview && fileInputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
              ${isDragging
                ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]'
                : preview
                  ? 'border-white/10 bg-black/30'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }
            `}
            style={{ minHeight: '320px' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
              id="image-upload-input"
            />

            <AnimatePresence mode="wait">
              {preview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full h-full min-h-[320px] flex items-center justify-center p-4"
                >
                  <img
                    src={preview}
                    alt="Medical scan preview"
                    className="max-w-full max-h-[280px] object-contain rounded-xl shadow-2xl"
                  />

                  {/* File info overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <ImagePlus className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300 truncate">{file?.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {(file?.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="ml-2 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      id="remove-image-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scanning line animation */}
                  {isLoading && (
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mb-6"
                  >
                    <Upload className="w-9 h-9 text-cyan-400" />
                  </motion.div>
                  <p className="text-white font-medium mb-2">Drop your scan here</p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                  <div className="flex gap-2">
                    {['JPG', 'JPEG', 'PNG'].map((fmt) => (
                      <span key={fmt} className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">
                        .{fmt}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Column — Scan Type & Submit */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-5"
        >
          {/* Scan Type Selector */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4">
              Select Scan Type
            </h3>
            <div className="space-y-3">
              {SCAN_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setScanType(type.id)}
                  id={`scan-type-${type.id}`}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                    ${scanType === type.id
                      ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div className="text-left">
                    <p className={`font-medium ${scanType === type.id ? 'text-cyan-300' : 'text-white'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500">{type.desc}</p>
                  </div>
                  {scanType === type.id && (
                    <motion.div
                      layoutId="scan-check"
                      className="ml-auto w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            whileHover={file && !isLoading ? { scale: 1.02 } : {}}
            whileTap={file && !isLoading ? { scale: 0.98 } : {}}
            id="analyze-image-btn"
            className={`
              relative w-full py-4 rounded-xl font-medium text-lg tracking-wide transition-all duration-300 overflow-hidden
              ${file && !isLoading
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] cursor-pointer'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
              }
            `}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing Scan...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyze Image
                </>
              )}
            </span>
            {file && !isLoading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.button>

          {/* Info Panel */}
          <div className="glass-panel rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-400 text-sm">⚠</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-relaxed">
                This tool provides AI-assisted analysis for educational purposes only. 
                It is <span className="text-amber-400 font-medium">not a substitute for professional medical diagnosis</span>. 
                Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
