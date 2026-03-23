/**
 * Layer 1: Pre-processing
 * Cleans, normalizes, and flags raw vitals and symptoms.
 * Acts as the strict first line of defense before AI reasoning.
 */

const preprocess = (rawData) => {
  const { symptoms, age, gender, history, hr, bp, spo2, temp } = rawData;

  // 1. Data Cleaning & Parsing
  const cleanData = {
    age: parseInt(age) || 0,
    gender: String(gender || 'Unknown').trim(),
    history: String(history || 'None').trim(),
    symptoms: String(symptoms || '').trim().toLowerCase(),
    hr: parseInt(hr),
    spo2: parseInt(spo2),
    temp: parseFloat(temp),
    bp: String(bp || '').trim() // format e.g., '120/80'
  };

  // 2. BP Parsing
  let systolic = null;
  let diastolic = null;
  if (cleanData.bp && cleanData.bp.includes('/')) {
    const parts = cleanData.bp.split('/');
    systolic = parseInt(parts[0]);
    diastolic = parseInt(parts[1]);
  }

  // 3. Strict Flagging (Critical Anomalies)
  const flags = {
    isHypoxic: cleanData.spo2 !== null && !isNaN(cleanData.spo2) && cleanData.spo2 < 90,
    isTachycardic: cleanData.hr !== null && !isNaN(cleanData.hr) && cleanData.hr >= 120,
    isBradycardic: cleanData.hr !== null && !isNaN(cleanData.hr) && cleanData.hr <= 50,
    isFebrile: cleanData.temp !== null && !isNaN(cleanData.temp) && cleanData.temp >= 100.4,
    isHyperpyrexic: cleanData.temp !== null && !isNaN(cleanData.temp) && cleanData.temp >= 104,
    isHypotensive: systolic !== null && systolic < 90,
    isHypertensiveCrisis: systolic !== null && systolic > 180,
    hasChestPain: cleanData.symptoms.includes('chest pain') || cleanData.symptoms.includes('angina'),
    hasShortnessOfBreath: cleanData.symptoms.includes('shortness of breath') || cleanData.symptoms.includes('dyspnea') || cleanData.symptoms.includes('breathing difficulty')
  };

  return {
    ...cleanData,
    systolic,
    diastolic,
    flags
  };
};

module.exports = { preprocess };
