import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepInput from './StepInput';
import VitalsInput from './VitalsInput';
import { Check, ArrowRight } from 'lucide-react';

export default function ConversationalFlow({ onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '45',
    gender: 'Male',
    history: '',
    hr: '80',
    bp: '120/80',
    spo2: '98',
    temp: '98.6'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenderSelect = (val) => {
    setFormData({ ...formData, gender: val });
    setTimeout(() => setCurrentStep(3), 400); // Auto advance
  };

  const advanceStep = () => setCurrentStep(prev => prev + 1);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderStepButton = (disabled) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={advanceStep}
      className={`mt-4 w-12 h-12 flex items-center justify-center rounded-full transition-all ${disabled ? 'bg-white/5 text-white/20' : 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]'}`}
    >
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 pb-40">
      
      <StepInput 
        id="symptoms" 
        question="Tell me what you're feeling right now..." 
        isActive={currentStep === 0} 
        isPast={currentStep > 0} 
        value={formData.symptoms}
      >
        <div className="relative">
          <textarea 
            name="symptoms" autoFocus
            value={formData.symptoms} onChange={handleChange}
            placeholder="e.g. Sharp chest pain, dizzy, out of breath..."
            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xl text-white outline-none focus:border-indigo-500/50 focus:bg-black/50 transition-all resize-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] h-32"
          />
          <div className="flex justify-end pr-2">
            {renderStepButton(formData.symptoms.length < 3)}
          </div>
        </div>
      </StepInput>

      <StepInput 
        id="age" 
        question="How old are you?" 
        isActive={currentStep === 1} 
        isPast={currentStep > 1} 
        value={formData.age + ' years old'}
      >
        <div className="flex items-center gap-6">
          <input 
            type="range" min="1" max="120" name="age" 
            value={formData.age} onChange={handleChange} 
            className="flex-1 h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
          />
          <input 
            type="number" name="age"
            value={formData.age} onChange={handleChange}
            className="w-24 bg-transparent border-b-2 border-indigo-400 text-3xl text-white font-bold text-center outline-none"
          />
          {renderStepButton(!formData.age)}
        </div>
      </StepInput>

      <StepInput 
        id="gender" 
        question="What is your biological gender?" 
        isActive={currentStep === 2} 
        isPast={currentStep > 2} 
        value={formData.gender}
      >
        <div className="flex gap-4">
          {['Male', 'Female', 'Other'].map(g => (
            <motion.button
              key={g} onClick={() => handleGenderSelect(g)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`flex-1 py-4 px-6 rounded-2xl border transition-all text-lg font-medium
                ${formData.gender === g 
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' 
                  : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'}`}
            >
              {g}
            </motion.button>
          ))}
        </div>
      </StepInput>

      <StepInput 
        id="history" 
        question="Any pre-existing medical conditions I should know about?" 
        isActive={currentStep === 3} 
        isPast={currentStep > 3} 
        value={formData.history || 'None reported'}
      >
        <div>
          <input 
            type="text" name="history" autoFocus
            value={formData.history} onChange={handleChange}
            placeholder="e.g. Asthma, Diabetes, Hypertension, or leave blank"
            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xl text-white outline-none focus:border-indigo-500/50 focus:bg-black/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          />
          <div className="flex justify-end mt-2 pr-2">
            {renderStepButton(false)}
          </div>
        </div>
      </StepInput>

      <StepInput 
        id="vitals" 
        question="Let's capture your current vitals." 
        isActive={currentStep === 4} 
        isPast={false} 
        value="Vitals captured"
      >
        <VitalsInput formData={formData} onChange={handleChange} onComplete={handleSubmit} />
      </StepInput>

    </div>
  );
}
