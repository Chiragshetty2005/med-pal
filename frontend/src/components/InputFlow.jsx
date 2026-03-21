import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Activity, Heart, Thermometer, Droplets } from 'lucide-react';

const steps = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'symptoms', title: 'Symptoms & History' },
  { id: 'vitals', title: 'Current Vitals' }
];

export default function InputFlow({ onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    symptoms: '', age: '', gender: 'Male', history: '',
    hr: '', bp: '', spo2: '', temp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 100 : -100, opacity: 0 })
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-8 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -z-10 transform -translate-y-1/2" />
        {steps.map((step, idx) => (
          <div key={idx} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500
            ${currentStep === idx ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 glow-indigo' : 
              currentStep > idx ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/10 bg-black/50 text-gray-500'}`}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="w-full"
          >
            <h2 className="text-2xl font-light mb-6 text-white">{steps[currentStep].title}</h2>
            
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="glass-input text-2xl" placeholder="e.g. 45" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input text-xl appearance-none">
                    <option className="bg-gray-900">Male</option>
                    <option className="bg-gray-900">Female</option>
                    <option className="bg-gray-900">Other</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Symptoms</label>
                  <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="glass-input resize-none h-32" placeholder="Describe how you are feeling..."></textarea>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Medical History (Optional)</label>
                  <input type="text" name="history" value={formData.history} onChange={handleChange} className="glass-input" placeholder="Past conditions, surgeries..." />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <Heart className="absolute top-4 right-4 text-red-400/50 w-5 h-5" />
                  <label className="block text-sm text-gray-400 mb-2">Heart Rate</label>
                  <input type="number" name="hr" value={formData.hr} onChange={handleChange} className="glass-input text-xl" placeholder="bpm" />
                </div>
                <div className="relative">
                  <Activity className="absolute top-4 right-4 text-blue-400/50 w-5 h-5" />
                  <label className="block text-sm text-gray-400 mb-2">Blood Pressure</label>
                  <input type="text" name="bp" value={formData.bp} onChange={handleChange} className="glass-input text-xl" placeholder="120/80" />
                </div>
                <div className="relative">
                  <Droplets className="absolute top-4 right-4 text-cyan-400/50 w-5 h-5" />
                  <label className="block text-sm text-gray-400 mb-2">SpO2 (%)</label>
                  <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} className="glass-input text-xl" placeholder="98" />
                </div>
                <div className="relative">
                  <Thermometer className="absolute top-4 right-4 text-orange-400/50 w-5 h-5" />
                  <label className="block text-sm text-gray-400 mb-2">Temp (°F)</label>
                  <input type="number" step="0.1" name="temp" value={formData.temp} onChange={handleChange} className="glass-input text-xl" placeholder="98.6" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <button 
            type="button" 
            onClick={prevStep}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <button 
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            {currentStep === steps.length - 1 ? 'Analyze Now' : 'Continue'}
            {currentStep === steps.length - 1 ? <Activity className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
