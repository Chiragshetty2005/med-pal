import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Thermometer } from 'lucide-react';

export default function VitalsInput({ formData, onChange, onComplete }) {
  
  const handleInputChange = (e) => {
    onChange(e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Heart Rate */}
      <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 bg-red-500 h-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-center mb-3">
          <label className="text-gray-400 font-medium flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> Heart Rate
          </label>
        </div>
        <div className="flex items-end gap-2">
          <input 
            type="number" name="hr" value={formData.hr} onChange={handleInputChange} 
            className="bg-transparent text-4xl font-bold text-white outline-none w-24 border-b border-gray-600 focus:border-red-400 transition-colors" 
            placeholder="-" autoFocus
          />
          <span className="text-gray-500 mb-2">BPM</span>
        </div>
      </motion.div>

      {/* Blood Pressure */}
      <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-center mb-3">
          <label className="text-gray-400 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Blood Pressure
          </label>
        </div>
        <div className="flex items-end gap-2">
          <input 
            type="text" name="bp" value={formData.bp} onChange={handleInputChange} 
            className="bg-transparent text-4xl font-bold text-white outline-none w-32 border-b border-gray-600 focus:border-blue-400 transition-colors" 
            placeholder="120/80" 
          />
          <span className="text-gray-500 mb-2">mmHg</span>
        </div>
      </motion.div>

      {/* SpO2 - Range Slider Style */}
      <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 md:col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 bg-cyan-500 h-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-center mb-4">
          <label className="text-gray-400 font-medium flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" /> Oxygen Saturation (SpO2)
          </label>
          <span className="text-2xl font-bold text-white">{formData.spo2 || '--'}%</span>
        </div>
        <input 
          type="range" min="70" max="100" name="spo2" 
          value={formData.spo2 || 98} onChange={handleInputChange} 
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>70% (Danger)</span>
          <span>100% (Optimal)</span>
        </div>
      </motion.div>

      {/* Temperature */}
      <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-5 md:col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 bg-orange-500 h-full opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-center mb-4">
          <label className="text-gray-400 font-medium flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400" /> Body Temperature
          </label>
          <span className="text-2xl font-bold text-white">{formData.temp || '--'} °F</span>
        </div>
        <input 
          type="range" min="95" max="106" step="0.1" name="temp" 
          value={formData.temp || 98.6} onChange={handleInputChange} 
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" 
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>95.0°F</span>
          <span>98.6°F</span>
          <span>106.0°F</span>
        </div>
      </motion.div>

      <div className="md:col-span-2 mt-6">
         <motion.button 
            onClick={onComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-lg tracking-wide shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
               Run Analysis <Activity className="w-5 h-5 group-hover:animate-pulse" />
            </span>
            <span className="relative z-10 text-xs text-indigo-200 font-normal">Initiate AI Diagnostic Core</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
      </div>
    </div>
  );
}
