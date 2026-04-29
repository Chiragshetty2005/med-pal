/**
 * LLM Explanation Service
 * Uses Groq API to convert medical image predictions into clear explanations.
 */

const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `You are an AI medical assistant.

Explain the following medical image analysis result in simple terms.

Rules:
- Do NOT give a final diagnosis
- Be cautious and safe
- Avoid complex medical jargon
- Always recommend professional consultation

Output MUST be a raw JSON object (no markdown, no wrappers) with this exact schema:
{
  "explanation": "Clear explanation of what the condition means, how serious it could be",
  "severity": "Low" | "Medium" | "High",
  "next_steps": ["step1", "step2", "step3"]
}`;

const explainPrediction = async ({ type, prediction, confidence, details, body_region }) => {
  if (!process.env.GROQ_API_KEY) {
    console.log('[LLM Explain] No GROQ_API_KEY — using mock explanation');
    return mockExplanation({ type, prediction, confidence });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let userPrompt = `Medical Image Analysis Result:
- Image Type: ${type}
- Prediction: ${prediction}
- Confidence: ${(confidence * 100).toFixed(1)}%`;

    if (body_region) {
      userPrompt += `\n- Body Region: ${body_region}`;
    }
    if (details) {
      userPrompt += `\n- Imaging Details: ${details}`;
    }

    userPrompt += `

Tasks:
1. Explain what the condition means
2. Indicate how serious it could be
3. Suggest next medical steps
4. Keep explanation clear and simple`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    
    // Extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    const cleanContent = match
      ? match[0]
      : content.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(cleanContent);

    return {
      explanation: parsed.explanation || 'Unable to generate explanation.',
      severity: parsed.severity || 'Medium',
      next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
    };
  } catch (error) {
    console.error('[LLM Explain] Error:', error.message);
    return mockExplanation({ type, prediction, confidence });
  }
};

/**
 * Mock explanation fallback when Groq API is unavailable.
 */
const mockExplanation = ({ type, prediction, confidence }) => {
  const predLower = prediction.toLowerCase();

  // Determine severity from prediction content
  let severity = 'Low';
  if (
    predLower.includes('tumor') ||
    predLower.includes('pneumonia') ||
    predLower.includes('nodule') ||
    predLower.includes('opacity')
  ) {
    severity = confidence > 0.8 ? 'High' : 'Medium';
  } else if (predLower.includes('normal') || predLower.includes('no ')) {
    severity = 'Low';
  }

  const explanations = {
    High: `The ${type} analysis has detected findings consistent with "${prediction}" with ${(confidence * 100).toFixed(1)}% confidence. This is a significant finding that warrants immediate medical attention. While this AI analysis is not a diagnosis, the confidence level suggests this should be reviewed by a specialist promptly.`,
    Medium: `The ${type} scan shows findings suggestive of "${prediction}" with ${(confidence * 100).toFixed(1)}% confidence. This finding is notable and should be evaluated by a healthcare professional. The moderate confidence level indicates further testing may be beneficial to confirm or rule out the condition.`,
    Low: `The ${type} analysis indicates "${prediction}" with ${(confidence * 100).toFixed(1)}% confidence. This appears to be a normal or low-concern finding. However, it's always recommended to discuss any medical imaging results with your healthcare provider for proper clinical context.`,
  };

  const nextSteps = {
    High: [
      'Schedule an urgent appointment with a specialist',
      `Request a follow-up ${type} scan for comparison`,
      'Bring this report to your next medical visit',
      'Monitor for any new or worsening symptoms',
    ],
    Medium: [
      'Consult with your primary care physician',
      'Consider scheduling additional diagnostic tests',
      'Keep a record of this analysis for your medical file',
      'Follow up within 2-4 weeks',
    ],
    Low: [
      'Share these results with your doctor at your next visit',
      'Continue routine health screenings',
      'Maintain a healthy lifestyle',
    ],
  };

  return {
    explanation: explanations[severity],
    severity,
    next_steps: nextSteps[severity],
  };
};

module.exports = { explainPrediction };
