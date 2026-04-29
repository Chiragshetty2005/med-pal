/**
 * Vision Analysis Service
 * Uses Groq's multimodal vision model to actually analyze medical images.
 * This replaces mock predictions with real image understanding.
 */

const Groq = require('groq-sdk');

/**
 * Analyze a medical image using Groq's vision model.
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType - Image MIME type (image/jpeg, image/png)
 * @param {string} userScanType - User-selected scan type hint
 * @returns {Object|null} { prediction, confidence, type, body_region, details }
 */
const analyzeImageWithVision = async (imageBuffer, mimeType, userScanType = 'xray') => {
  if (!process.env.GROQ_API_KEY) {
    console.log('[Vision] No GROQ_API_KEY — cannot do vision analysis');
    return null;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Convert image buffer to base64 data URI
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const typeHint = {
      xray: 'X-ray',
      mri: 'MRI scan',
      ct: 'CT scan',
    }[userScanType] || 'medical scan';

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `You are an expert radiologist AI that analyzes medical images. You always respond with ONLY a JSON object, no other text. No markdown fences, no explanation outside the JSON.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this medical image (uploaded as "${typeHint}").

IMPORTANT: Look at the ACTUAL image content. Identify the body part shown and any visible abnormalities.

Respond with ONLY this JSON (no markdown, no code fences, no extra text):
{"prediction":"<specific finding e.g. Hip Fracture Detected, Pneumonia Detected, Normal Chest X-ray>","confidence":<0.0 to 1.0>,"type":"<X-ray or MRI or CT Scan>","body_region":"<Chest, Hip, Pelvis, Brain, Spine, Knee, etc>","details":"<what you actually observe in the image>"}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUri,
              },
            },
          ],
        },
      ],
      temperature: 0.1, // Very low for deterministic output
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    console.log('[Vision] Raw response:', content);

    // Try to extract JSON — handle markdown code fences
    let jsonStr = content;
    
    // Remove markdown code fences if present
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Extract the JSON object
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('[Vision] Could not extract JSON from response:', content);
      // Try to parse the whole thing as JSON
      try {
        const directParse = JSON.parse(jsonStr);
        if (directParse.prediction) {
          return normalizeResult(directParse, typeHint);
        }
      } catch (e) {
        // Fall through
      }
      return null;
    }

    const parsed = JSON.parse(match[0]);
    return normalizeResult(parsed, typeHint);

  } catch (error) {
    console.error('[Vision] Analysis failed:', error.message);
    return null;
  }
};

/**
 * Normalize the parsed JSON result into a consistent format.
 */
function normalizeResult(parsed, typeHint) {
  const prediction = parsed.prediction || parsed.finding || parsed.diagnosis || '';
  
  // Skip results that don't actually identify anything
  if (!prediction || prediction.toLowerCase().includes('unable to determine')) {
    return null;
  }

  return {
    prediction: prediction,
    confidence: typeof parsed.confidence === 'number'
      ? Math.min(Math.max(parsed.confidence, 0), 1)
      : 0.75,
    type: parsed.type || typeHint,
    body_region: parsed.body_region || parsed.region || 'Unknown',
    details: parsed.details || parsed.description || parsed.observations || '',
  };
}

module.exports = { analyzeImageWithVision };
