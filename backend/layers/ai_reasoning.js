/**
 * Layer 2: AI Reasoning
 * Interacts with the LLM to synthesize pre-processed data into clinical insights.
 * Includes a robust fallback if GROQ_API_KEY is not configured.
 */
const Groq = require('groq-sdk');

const aiReasoning = async (cleanData) => {
  // If Groq key is present, use it; otherwise use the Mock Provider.
  if (process.env.GROQ_API_KEY) {
    return await callRealLLM(cleanData);
  } else {
    return await callMockLLM(cleanData);
  }
};

const buildSystemPrompt = () => {
  return `You are Med-Pal, an expert medical AI triage system. 
Analyze the provided patient data and output a raw JSON object (without markdown wrappers).
The JSON MUST follow this schema exactly:
{
  "Severity": "Safe" | "Warning" | "Emergency",
  "PossibleConditions": ["Condition 1", "Condition 2"],
  "Recommendations": ["Action 1", "Action 2"],
  "PrimaryDomain": "e.g., Cardiovascular, Respiratory, Neurological",
  "Explanation": "Detailed clinical reasoning based on the provided symptoms and vitals."
}`;
};

const callRealLLM = async (cleanData) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const userPrompt = `Patient Profile:
Age/Gender: ${cleanData.age} ${cleanData.gender}
History: ${cleanData.history}
Symptoms: ${cleanData.symptoms}
Vitals: HR ${cleanData.hr}, SpO2 ${cleanData.spo2}%, Temp ${cleanData.temp}F, BP ${cleanData.bp}

Detected Flags: ${JSON.stringify(cleanData.flags)}
Please analyze.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'groq/compound', // Using Groq's Compound system as requested
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temperature for deterministic medical reasoning
      response_format: { type: 'json_object' } // Enforce JSON format at the API level
    });

    const content = response.choices[0].message.content;
    // Extract everything between the first '{' and last '}' using regex to handle conversational prefixes
    const match = content.match(/\{[\s\S]*\}/);
    const cleanContent = match ? match[0] : content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("LLM Generation Error:", error);
    return await callMockLLM(cleanData); // Fallback on failure
  }
};

const callMockLLM = async (cleanData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { flags, symptoms, temp, hr, spo2 } = cleanData;
  const isEmergency = flags.isHypoxic || flags.isTachycardic || flags.hasChestPain || flags.isHypotensive || flags.isHypertensiveCrisis || flags.isHyperpyrexic;
  const isWarning = flags.isFebrile || flags.hasShortnessOfBreath || symptoms.includes('cough');

  if (isEmergency) {
    return {
      Severity: "Emergency",
      PossibleConditions: ["Critical Condition Suspected (e.g., Myocardial Infarction, Severe Hypoxemia)"],
      Recommendations: ["Call emergency services immediately", "Do not drive yourself to the hospital"],
      PrimaryDomain: flags.hasChestPain ? "Cardiovascular" : "Systemic/Respiratory",
      Explanation: "The combination of anomalous vitals and acute symptoms strongly correlates with critical distress requiring immediate stabilization."
    };
  } else if (isWarning) {
    return {
      Severity: "Warning",
      PossibleConditions: ["Viral Infection", "Mild Dehydration", "Inflammatory Response"],
      Recommendations: ["Monitor symptoms closely", "Rest and hydrate", "Consult a physician if symptoms persist or worsen"],
      PrimaryDomain: "Respiratory/Infectious",
      Explanation: "Elevated temperature or specific symptoms suggest a localized infection or inflammatory immune response."
    };
  } else {
    return {
      Severity: "Safe",
      PossibleConditions: ["Healthy Adult", "Normal Baseline"],
      Recommendations: ["Maintain healthy habits", "Rest well", "Stay hydrated"],
      PrimaryDomain: "General Health",
      Explanation: "All recorded vital signs and symptoms appear stable, indicating normal baseline health with no immediate acute risks."
    };
  }
};

module.exports = { aiReasoning };
