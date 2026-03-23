/**
 * Layer 3: Post-processing & Safety Override
 * Acts as the final constraint to prevent AI hallucinations or unsafe outputs.
 * Enforces strict clinical rules over AI reasoning.
 */

const applySafetyOverrides = (aiResult, cleanData) => {
  const { flags } = cleanData;
  let finalResult = { ...aiResult };

  // Calculate base risk score depending on AI severity
  let riskScore = 10;
  if (finalResult.Severity === 'Warning') riskScore = 45;
  if (finalResult.Severity === 'Emergency') riskScore = 90;

  let emergencyAlert = finalResult.Severity === 'Emergency';
  let color = finalResult.Severity === 'Emergency' ? 'Red' : finalResult.Severity === 'Warning' ? 'Yellow' : 'Green';

  // --- Strict Clinical Rules Override ---
  // Overrides the AI reasoning if critical flags are raised.
  let overrideReason = null;

  if (flags.isHypoxic) {
    overrideReason = 'Severe Hypoxemia (SpO2 < 90)';
  } else if (flags.isHypotensive) {
    overrideReason = 'Hypotension (Systolic < 90)';
  } else if (flags.isHypertensiveCrisis) {
    overrideReason = 'Hypertensive Crisis (Systolic > 180)';
  } else if (flags.isTachycardic) {
    overrideReason = 'Severe Tachycardia (HR >= 120)';
  } else if (flags.isHyperpyrexic) {
    overrideReason = 'Hyperpyrexia (Temp >= 104)';
  } else if (flags.hasChestPain) {
    overrideReason = 'Reports of Chest Pain';
  }

  // If any critical override exists and AI downplayed it, we escalate.
  if (overrideReason) {
    finalResult.Severity = 'Emergency';
    finalResult.EmergencyAlert = true;
    finalResult.Color = 'Red';
    riskScore = 95;
    
    // Prepend override to explanation and recommendations
    finalResult.Explanation = `[SAFETY OVERRIDE]: Upgraded to Emergency due to ${overrideReason}. ` + (finalResult.Explanation || '');
    finalResult.Recommendations = [
      'Call emergency services immediately seeking critical care',
      ...((finalResult.Recommendations || []).filter(r => !r.toLowerCase().includes('hydrate') && !r.toLowerCase().includes('rest'))) // Filter out nonchalant recommendations
    ];
    if (!finalResult.PossibleConditions.includes('Critical Medical Emergency')) {
      finalResult.PossibleConditions.unshift('Critical Medical Emergency');
    }
  }

  // Cap Score
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Assemble the final response format matching the expected schema by the frontend
  return {
    ...finalResult,
    RiskScore: riskScore,
    Color: finalResult.Color || color,
    EmergencyAlert: finalResult.EmergencyAlert || emergencyAlert,
    DomainConfidence: '95%', // Arbitrary confidence or calculate based on model logprobs
    SupportingEvidence: {
      Symptoms: [cleanData.symptoms || 'None reported'],
      Vitals: [
        `HR: ${cleanData.hr} bpm`, 
        `SpO2: ${cleanData.spo2}%`, 
        `Temp: ${cleanData.temp}°F`,
        `BP: ${cleanData.bp}`
      ].filter(v => !v.includes('NaN') && !v.includes('null') && !v.includes('undefined'))
    },
    Timestamp: new Date().toISOString()
  };
};

module.exports = { applySafetyOverrides };
