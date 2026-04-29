// components/aira/VoiceInterface.jsx
// Video consultation room UI — AIRA face as primary display, user cam as PiP
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, X, Send, PhoneOff, ChevronDown, ChevronUp } from 'lucide-react';
import ConversationManager from './ConversationManager';
import TranscriptDisplay from './TranscriptDisplay';
import AIRAFace from './AIRAFace';
import VideoFeed from './VideoFeed';

export default function VoiceInterface({ onSubmit, onReset }) {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [showExtracted, setShowExtracted] = useState(false);

  return (
    <ConversationManager onResult={onSubmit} onReset={onReset}>
      {({
        messages, liveTranscript, isListening, isThinking, isSpeaking,
        isAlert, extractedData, analysisStatus, speechSupported,
        micEnabled, aiState, toggleMic, handleUserSpeech, onReset: doReset,
      }) => {

        const statusText =
          analysisStatus === 'extracting' ? 'Extracting Data…' :
          analysisStatus === 'analyzing'  ? 'Running Analysis…' :
          analysisStatus === 'done'       ? 'Analysis Complete' :
          analysisStatus === 'error'      ? 'Error' :
          isListening  ? 'Listening…' :
          isThinking   ? 'Thinking…' :
          isSpeaking   ? 'Speaking…' : 'Live';

        const statusColor =
          analysisStatus === 'error' ? '#f87171' :
          analysisStatus === 'done'  ? '#34d399' :
          isListening ? '#22d3ee' :
          isSpeaking  ? '#34d399' : '#6366f1';

        const handleSend = () => {
          if (typedInput.trim()) {
            handleUserSpeech(typedInput.trim());
            setTypedInput('');
          }
        };

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-2xl mx-auto flex flex-col gap-3"
          >
            {/* ── Emergency Banner ───────────────────────────────────── */}
            <AnimatePresence>
              {isAlert && (
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/60 flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <p className="text-red-200 font-semibold text-sm">
                    ⚠ HIGH RISK DETECTED — Seek immediate medical attention. Dr. AIRA is explaining your results.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Video Call Frame ────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(18,10,50,0.92) 0%, rgba(6,3,18,0.97) 100%)',
                border: `1px solid ${statusColor}33`,
                boxShadow: `0 0 60px ${statusColor}22, 0 20px 60px rgba(0,0,0,0.7)`,
              }}>

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  <span className="text-xs font-mono tracking-widest uppercase text-white/50">
                    AI Medical Consultation · {statusText}
                  </span>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={doReset}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/30 hover:text-red-400 transition-all">
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Main face area */}
              <div className="relative flex items-center justify-center py-6 px-4"
                style={{ minHeight: 380, background: 'radial-gradient(ellipse at center, rgba(40,20,90,0.4) 0%, transparent 70%)' }}>

                {/* AIRA animated face — main display */}
                <AIRAFace state={aiState} />

                {/* User camera PiP — bottom right */}
                {videoEnabled && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 right-4 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}>
                    <VideoFeed enabled={videoEnabled} />
                  </motion.div>
                )}

                {/* Live transcript overlay — bottom left */}
                <AnimatePresence>
                  {isListening && liveTranscript && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-4 max-w-[55%] px-3 py-2 rounded-xl text-sm text-cyan-200 italic"
                      style={{ background: 'rgba(14,116,144,0.18)', border: '1px solid rgba(34,211,238,0.25)', backdropFilter: 'blur(8px)' }}>
                      "{liveTranscript}"
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analysis progress overlay */}
                <AnimatePresence>
                  {(analysisStatus === 'extracting' || analysisStatus === 'analyzing') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ background: 'rgba(6,3,18,0.65)', backdropFilter: 'blur(4px)' }}>
                      <div className="flex flex-col items-center gap-3">
                        <motion.div className="w-12 h-12 rounded-full border-2 border-violet-500/40"
                          style={{ borderTopColor: '#a78bfa' }}
                          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                        <p className="text-violet-300 font-mono text-sm tracking-widest uppercase">
                          {analysisStatus === 'extracting' ? 'Extracting Data…' : 'Analyzing…'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-white/5"
                style={{ background: 'rgba(0,0,0,0.3)' }}>

                {/* Mic */}
                {speechSupported ? (
                  <motion.button id="aira-mic" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={toggleMic}
                    disabled={analysisStatus !== 'idle'}
                    className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-40 ${
                      micEnabled
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                        : 'bg-white/5 border-white/20 text-white/50 hover:border-white/40 hover:text-white/80'
                    }`}>
                    {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    {isListening && (
                      <motion.div className="absolute inset-0 rounded-full border-2 border-cyan-400"
                        animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity }} />
                    )}
                  </motion.button>
                ) : (
                  <div className="text-xs text-yellow-400/70 font-mono bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
                    Voice not supported — use text input
                  </div>
                )}

                {/* Video toggle */}
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={() => setVideoEnabled(v => !v)}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    videoEnabled
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                      : 'bg-white/5 border-white/20 text-white/50 hover:border-white/40 hover:text-white/80'
                  }`}>
                  {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </motion.button>

                {/* Chat transcript toggle */}
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={() => setChatOpen(o => !o)}
                  className="w-14 h-14 rounded-full bg-white/5 border-2 border-white/20 text-white/50 hover:border-white/40 hover:text-white/80 flex items-center justify-center transition-all">
                  {chatOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </motion.button>

                {/* End session */}
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={doReset}
                  className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]">
                  <PhoneOff className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* ── Chat transcript (collapsible) ──────────────────────── */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background: 'rgba(10,6,28,0.85)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(16px)',
                  }}>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-mono text-white/25 tracking-widest uppercase">
                      Consultation Transcript
                    </span>
                  </div>
                  <div className="px-4 pb-3">
                    {messages.length === 0
                      ? <p className="text-center text-white/20 text-xs py-6 font-mono">Dr. AIRA is starting the consultation…</p>
                      : <TranscriptDisplay messages={messages} isThinking={isThinking} />
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Text input bar ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-2">
              <input
                id="aira-text-input"
                type="text"
                value={typedInput}
                onChange={e => setTypedInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                disabled={isThinking || analysisStatus !== 'idle'}
                placeholder={isThinking ? 'Dr. AIRA is thinking…' : micEnabled ? 'Speaking… or type here' : 'Type your message…'}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all disabled:opacity-40"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!typedInput.trim() || isThinking || analysisStatus !== 'idle'}
                className="w-12 h-12 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <Send className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ── Extracted data (debug, collapsible) ────────────────── */}
            {extractedData && (
              <div className="px-2">
                <button onClick={() => setShowExtracted(s => !s)}
                  className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/45 font-mono transition-colors">
                  <ChevronDown className={`w-3 h-3 transition-transform ${showExtracted ? 'rotate-180' : ''}`} />
                  Extracted Medical Data
                </button>
                <AnimatePresence>
                  {showExtracted && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-2 overflow-hidden">
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                        {Object.entries(extractedData).map(([k, v]) => (
                          <div key={k} className="flex justify-between bg-white/3 rounded-lg px-3 py-1.5 border border-white/5">
                            <span className="text-violet-400/70 uppercase">{k}</span>
                            <span className="text-white/60">{v ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hint */}
            <p className="text-center text-[11px] text-white/18 font-mono">
              {speechSupported
                ? micEnabled ? 'Mic active – speak naturally' : 'Click 🎤 to speak or type below'
                : 'Web Speech not supported — use text input'}
            </p>
          </motion.div>
        );
      }}
    </ConversationManager>
  );
}
