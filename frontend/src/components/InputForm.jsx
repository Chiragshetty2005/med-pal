import { useState } from 'react';

export default function InputForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    symptoms: '',
    age: '',
    gender: 'Other',
    history: '',
    hr: '',
    bp: '',
    spo2: '',
    temp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">New Assessment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (Describe detailed symptoms)</label>
          <textarea 
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            rows="3"
            required
            placeholder="e.g. Chest pain, shortness of breath, headache..."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical History (Optional)</label>
          <input type="text" name="history" value={formData.history} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="Diabetes, Hypertension, etc." />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
            <input type="number" name="hr" value={formData.hr} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="bpm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
            <input type="text" name="bp" value={formData.bp} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="120/80" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
            <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="98" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°F)</label>
            <input type="number" step="0.1" name="temp" value={formData.temp} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" placeholder="98.6" required />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors disabled:bg-gray-400"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </form>
    </div>
  );
}
