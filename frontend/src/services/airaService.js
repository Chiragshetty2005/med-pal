// src/services/airaService.js
// Dr. AIRA service layer — calls Groq API directly from the browser.
// Zero backend modifications. Uses existing analyzePatientData for /analyze.

import { analyzePatientData } from './api';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ─── System prompt for Dr. AIRA ──────────────────────────────────────────────
export const AIRA_SYSTEM_PROMPT = `You are Dr. AIRA (AI Responsive Assistant), a compassionate and professional AI medical assistant for the MedPal system.

Your role is to collect the patient's medical information through a warm, natural conversation.

== STRICT CONVERSATION FLOW (follow this order exactly) ==

STEP 1 — SYMPTOMS
Ask: "What symptoms are you experiencing right now?"
Wait for the patient's answer before moving on.

STEP 2 — AGE
After symptoms, ask: "How old are you?"

STEP 3 — GENDER
After age, ask: "What is your biological gender? (Male, Female, or Other)"

STEP 4 — MEDICAL HISTORY
After gender, ask: "Do you have any pre-existing medical conditions such as diabetes, hypertension, or asthma? You can say 'none' if not."

STEP 5 — VITALS (ask each one separately, one at a time)
After history, tell the patient: "Now I'd like to check a few vitals. Each one is optional — just say 'skip' if you don't know."
Then ask each vital ONE BY ONE in this order:
  5a. "What is your current heart rate (pulse) in beats per minute?"
  5b. "What is your blood pressure? For example, '120 over 80'."
  5c. "What is your blood oxygen level (SpO2)? It's usually shown as a percentage on a pulse oximeter."
  5d. "What is your body temperature?"

Only move to the next vital after the patient answers or says 'skip'.

STEP 6 — TRIGGER ANALYSIS
Only AFTER completing ALL vitals questions (or the patient has skipped them all), output the exact phrase: READY_TO_ANALYZE
Do not output READY_TO_ANALYZE at any earlier step.

== RULES ==
- Ask ONE question at a time — never stack multiple questions
- Be empathetic, warm, and professional
- Use simple language
- Acknowledge the patient's answer before moving to the next question
- After analysis results are provided, explain them warmly in simple words (3-4 sentences max), mentioning severity and key recommendations

IMPORTANT: Never start with a greeting if conversation history already exists. Seamlessly continue the conversation.
IMPORTANT: Always respond in English only.
IMPORTANT: Never skip Step 5. Always ask all 4 vitals questions before triggering READY_TO_ANALYZE.`;

// ─── Call Groq API ────────────────────────────────────────────────────────────
export async function callGroq(messages) {
  if (!GROQ_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set in frontend .env');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Extract structured medical data from conversation ─────────────────────
export async function extractMedicalData(conversationHistory) {
  const conversationText = conversationHistory
    .map((m) => `${m.role === 'user' ? 'Patient' : 'Dr. AIRA'}: ${m.content}`)
    .join('\n');

  const extractionMessages = [
    {
      role: 'system',
      content: `You are a precise medical data extraction engine. Your only job is to extract structured medical data from a conversation transcript and return valid JSON.

Rules:
- Return ONLY a single valid JSON object — no markdown, no explanation, no code fences
- For fields the patient did not provide or said "skip" / "I don't know", use null
- Convert spoken numbers to digits: "seventy eight" → "78", "one twenty over eighty" → "120/80"
- For heart rate (hr): extract the number in beats per minute. Examples: "78 bpm" → "78", "pulse is 90" → "90", "heart rate 65" → "65"
- For blood pressure (bp): format as "systolic/diastolic". Examples: "120 over 80" → "120/80", "130/85" → "130/85", "one forty over ninety" → "140/90"
- For SpO2 (spo2): extract the percentage number only. Examples: "98 percent" → "98", "oxygen is 97" → "97", "spo2 ninety nine" → "99"
- For temperature (temp): extract the numeric value. Examples: "98.6 fahrenheit" → "98.6", "37 celsius" → "37", "fever of 101" → "101"
- For gender: normalize to "Male", "Female", or "Other". "man" → "Male", "woman" → "Female"
- For age: extract just the number as a string. "I am 45 years old" → "45"
- For history: summarize all mentioned conditions. "none" or "no history" → "None"
- For symptoms: summarize ALL symptoms mentioned throughout the conversation

Required JSON schema (output this exact structure):
{
  "symptoms": "<string summarizing all symptoms>",
  "age": "<number as string>",
  "gender": "Male | Female | Other",
  "history": "<string or null>",
  "hr": "<number as string or null>",
  "bp": "<'systolic/diastolic' string or null>",
  "spo2": "<number as string or null>",
  "temp": "<number as string or null>"
}`,
    },
    {
      role: 'user',
      content: `Extract ALL medical data from this doctor-patient conversation. Pay special attention to any numbers mentioned for heart rate, blood pressure, SpO2, and temperature — even if stated informally.\n\nConversation:\n${conversationText}\n\nReturn ONLY the JSON object:`,
    },
  ];

  const raw = await callGroq(extractionMessages);

  console.log('[AIRA] Raw extraction:', raw);

  // Robustly find the JSON object — grab everything between first '{' and last '}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0].trim() : '';

  console.log('[AIRA] Cleaned extraction:', cleaned);

  try {
    if (!cleaned) throw new Error('No JSON object found in response');
    const parsed = JSON.parse(cleaned);
    console.log('[AIRA] Extracted data:', parsed);

    // Normalize: replace undefined/empty string values with null for consistency
    const normalized = {};
    for (const [k, v] of Object.entries(parsed)) {
      normalized[k] = (v === '' || v === 'null' || v === 'undefined') ? null : v;
    }
    return normalized;
  } catch (e) {
    console.warn('[AIRA] JSON parse failed:', e.message, '\nRaw:', raw);
    // Last-resort: return partial data with symptoms at minimum
    return {
      symptoms: extractSymptomsFallback(conversationText),
      age: null,
      gender: null,
      history: null,
      hr: null,
      bp: null,
      spo2: null,
      temp: null,
    };
  }
}

// Simple regex fallback to at least pull symptoms if JSON parse fails
function extractSymptomsFallback(conversationText) {
  const symptomsMatch = conversationText.match(
    /(?:symptoms?|feeling|experiencing|pain|ache|discomfort)[^.\n]{0,200}/i
  );
  return symptomsMatch ? symptomsMatch[0].trim() : 'Symptoms not clearly captured — please review conversation';
}

// ─── Trigger the existing /analyze endpoint ───────────────────────────────
export async function triggerAnalysis(extractedData) {
  // Reuse the exact same function used by ConversationalFlow
  return analyzePatientData(extractedData);
}

// ─── Generate AIRA's spoken explanation of analysis result ────────────────
export async function generateResultExplanation(analysisResult, conversationHistory) {
  const messages = [
    {
      role: 'system',
      content: `${AIRA_SYSTEM_PROMPT}

You have just received the analysis result for your patient. Explain it conversationally and empathetically in 3-4 sentences maximum. 
- Mention the key finding and severity
- If Emergency or High severity, speak with urgency and tell them to seek immediate care
- Keep it warm, human, and clear — no medical jargon
- Do not repeat the full list of conditions — just summarize what matters most`,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: `Analysis complete. Here are the results: ${JSON.stringify(analysisResult)}. Please explain this to me.`,
    },
  ];

  return callGroq(messages);
}
