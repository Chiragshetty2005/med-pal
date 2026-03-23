/**
 * Analyze Service (Orchestrator)
 * Ties together the 3-Layer Architecture: Pre-processing, AI Reasoning, Post-processing
 */

const { preprocess } = require('../layers/preprocessing');
const { aiReasoning } = require('../layers/ai_reasoning');
const { applySafetyOverrides } = require('../layers/postprocessing');

const analyzePatient = async (patientData) => {
  try {
    // 1. Pre-Processing (Clean data, flag anomalies)
    const cleanData = preprocess(patientData);

    // 2. AI Reasoning (LLM generation based on clean context)
    const aiResult = await aiReasoning(cleanData);

    // 3. Post-Processing & Safety Rules (Enforce strict clinic rules)
    const finalResult = applySafetyOverrides(aiResult, cleanData);

    return finalResult;
  } catch (error) {
    console.error("Central Analyze Service Error:", error);
    // Return a safe fallback on total systemic failure
    return {
      Severity: "Unknown",
      PossibleConditions: ["System Error Processing Data"],
      Recommendations: ["Seek clinical evaluation directly, system currently impaired"],
      Color: "Yellow",
      RiskScore: 50,
      EmergencyAlert: false,
      Timestamp: new Date().toISOString()
    };
  }
};

module.exports = { analyzePatient };
