/**
 * Mock LLM Service for Med-Pal MVP
 */

const analyzePatient = async (patientData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { symptoms, age, hr, spo2, temp } = patientData;

  // Simple rule-based mock for MVP simulation
  let severity = 'Safe'; // Safe, Warning, Emergency
  let color = 'Green';
  let riskScore = 10;
  let emergencyAlert = false;
  let conditions = ['Healthy adult'];
  let recommendations = ['Rest', 'Drink water'];
  
  if (temp > 102 || spo2 < 90 || hr > 120 || (symptoms && symptoms.toLowerCase().includes('chest pain'))) {
    severity = 'Emergency';
    color = 'Red';
    riskScore = 95;
    emergencyAlert = true;
    conditions = ['Possible Myocardial Infarction', 'Severe Hypoxemia'];
    recommendations = ['Call emergency services immediately', 'Do not drive yourself to hospital'];
  } else if (temp > 99.5 || hr > 100 || (symptoms && symptoms.toLowerCase().includes('cough'))) {
    severity = 'Warning';
    color = 'Yellow';
    riskScore = 45;
    conditions = ['Viral Infection', 'Mild Dehydration'];
    recommendations = ['Monitor temperature', 'Rest and hydrate', 'Consult physician if symptoms persist'];
  } else {
    severity = 'Safe';
    color = 'Green';
    riskScore = 15;
    conditions = ['No immediate life-threatening conditions identified'];
    recommendations = ['Maintain healthy lifestyle', 'Routine follow-up'];
  }

  // Build the structured JSON response
  return {
    PossibleConditions: conditions,
    Severity: severity,
    Color: color,
    EmergencyAlert: emergencyAlert,
    RiskScore: riskScore,
    Recommendations: recommendations,
    Timestamp: new Date().toISOString()
  };
};

module.exports = { analyzePatient };
