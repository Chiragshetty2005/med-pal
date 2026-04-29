// components/aira/ConversationManager.jsx
// The brain of Dr. AIRA. Manages:
//   - SpeechRecognition (voice input)
//   - Groq conversation (Dr. AIRA responses)
//   - Medical data extraction
//   - /analyze trigger
//   - SpeechSynthesis (voice output)
//
// Exposes state and controls via render props / callback props.
// NO backend changes — uses the existing /analyze API.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  callGroq,
  extractMedicalData,
  triggerAnalysis,
  generateResultExplanation,
  AIRA_SYSTEM_PROMPT,
} from '../../services/airaService';

// ─── Speech Recognition setup ────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ConversationManager({ onResult, onReset, children }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]); // {role, content}[]
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle | extracting | analyzing | done | error
  const [speechSupported] = useState(() => !!SpeechRecognition);
  const [micEnabled, setMicEnabled] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesRef = useRef(messages); // always-fresh ref for async handlers
  messagesRef.current = messages;

  // ── Boot greeting ──────────────────────────────────────────────────────────
  useEffect(() => {
    bootGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function bootGreeting() {
    const greeting = "Hello! I'm Dr. AIRA, your AI medical assistant. I'll ask you a few questions to understand your situation. Let's start — what symptoms are you experiencing right now?";
    const aiMsg = { role: 'assistant', content: greeting };
    setMessages([aiMsg]);
    await speakText(greeting);
  }

  // ── Text-to-Speech ─────────────────────────────────────────────────────────
  const speakText = useCallback(async (text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      // Prefer a natural English voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha'))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  }, []);

  // ── SpeechRecognition management ───────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!speechSupported || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setLiveTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setLiveTranscript(interim || final);
      if (final.trim()) {
        handleUserSpeech(final.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setLiveTranscript('');
    };

    recognition.onerror = (e) => {
      console.warn('[AIRA] SpeechRecognition error:', e.error);
      setIsListening(false);
    };

    recognition.start();
  }, [speechSupported, isListening]); // eslint-disable-line

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (micEnabled) {
      stopListening();
      setMicEnabled(false);
    } else {
      setMicEnabled(true);
      startListening();
    }
  }, [micEnabled, startListening, stopListening]);

  // Re-trigger listening after each response (continuous conversation loop)
  useEffect(() => {
    if (micEnabled && !isSpeaking && !isThinking && analysisStatus === 'idle') {
      const t = setTimeout(() => startListening(), 600);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, isThinking, micEnabled, analysisStatus]); // eslint-disable-line

  // ── Handle user speech ─────────────────────────────────────────────────────
  async function handleUserSpeech(transcript) {
    stopListening();

    const userMsg = { role: 'user', content: transcript };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(updatedMessages);
    setIsThinking(true);

    try {
      // Build Groq messages
      const groqMessages = [
        { role: 'system', content: AIRA_SYSTEM_PROMPT },
        ...updatedMessages,
      ];

      const aiReply = await callGroq(groqMessages);

      // Check for the internal trigger phrase
      if (aiReply.includes('READY_TO_ANALYZE')) {
        const cleanReply = aiReply.replace('READY_TO_ANALYZE', '').trim();
        const confirmMsg =
          cleanReply ||
          "Thank you for sharing. I have enough information to analyze your condition now. Please hold on while I run a full assessment.";

        const newMessages = [...updatedMessages, { role: 'assistant', content: confirmMsg }];
        setMessages(newMessages);
        setIsThinking(false);

        await speakText(confirmMsg);
        await runAnalysis(newMessages);
        return;
      }

      // Normal conversation reply
      const aiMsg = { role: 'assistant', content: aiReply };
      setMessages([...updatedMessages, aiMsg]);
      setIsThinking(false);
      await speakText(aiReply);

    } catch (err) {
      console.error('[AIRA] Groq call failed:', err);
      const errMsg = "I'm having trouble connecting right now. Please try speaking again.";
      setMessages([...updatedMessages, { role: 'assistant', content: errMsg }]);
      setIsThinking(false);
      await speakText(errMsg);
    }
  }

  // ── Run the analysis pipeline ──────────────────────────────────────────────
  async function runAnalysis(conversationHistory) {
    setAnalysisStatus('extracting');

    try {
      // Step 1: Extract structured data
      const data = await extractMedicalData(conversationHistory);
      setExtractedData(data);
      setAnalysisStatus('analyzing');

      // Step 2: Call existing /analyze endpoint
      const result = await triggerAnalysis(data);

      // Step 3: Check for high-risk
      const isHighRisk = result.Severity === 'Emergency' || result.Severity === 'High';
      if (isHighRisk) {
        setIsAlert(true);
        const alertMsg = `⚠ WARNING: Based on your symptoms and vitals, I'm detecting ${result.Severity} risk indicators. ${result.Recommendations?.[0] || 'Please seek immediate medical attention.'}`;
        await speakText(alertMsg);
      }

      // Step 4: Generate spoken explanation
      const explanation = await generateResultExplanation(result, conversationHistory);
      const finalMessages = [
        ...conversationHistory,
        { role: 'assistant', content: explanation },
      ];
      setMessages(finalMessages);
      setAnalysisStatus('done');

      await speakText(explanation);

      // Step 5: Pass results up to App
      onResult(result);

    } catch (err) {
      console.error('[AIRA] Analysis pipeline failed:', err);
      const errMsg = "I encountered an issue during the analysis. Let's try again or switch to the standard form.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
      setAnalysisStatus('error');
      await speakText(errMsg);
    }
  }

  // ── Expose state to children via render prop pattern ───────────────────────
  const aiState = isAlert
    ? 'alert'
    : isSpeaking
    ? 'speaking'
    : isThinking
    ? 'thinking'
    : isListening
    ? 'listening'
    : 'idle';

  return children({
    // State
    messages,
    liveTranscript,
    isListening,
    isThinking,
    isSpeaking,
    isAlert,
    extractedData,
    analysisStatus,
    speechSupported,
    micEnabled,
    aiState,
    // Controls
    toggleMic,
    startListening,
    stopListening,
    handleUserSpeech, // for typed input fallback
    onReset,
  });
}
