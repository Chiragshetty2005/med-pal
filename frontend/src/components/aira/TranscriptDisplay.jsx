// components/aira/TranscriptDisplay.jsx
// Scrolling chat-bubble transcript. AIRA messages on the left, patient on the right.
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ y: [-3, 3, -3], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function TranscriptDisplay({ messages = [], isThinking = false }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto pr-1"
      style={{ maxHeight: '380px', minHeight: '120px' }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => {
          const isAira = msg.role === 'assistant';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex items-end gap-2 ${isAira ? 'justify-start' : 'justify-end'}`}
            >
              {/* AIRA icon */}
              {isAira && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isAira
                    ? 'bg-violet-950/60 border border-violet-500/20 text-violet-100 rounded-bl-sm'
                    : 'bg-white/8 border border-white/10 text-gray-200 rounded-br-sm'
                }`}
                style={isAira ? { backdropFilter: 'blur(8px)' } : {}}
              >
                {msg.content}
                {/* Sender label */}
                <div className={`text-[10px] mt-1 font-mono ${isAira ? 'text-violet-400/60' : 'text-gray-500'}`}>
                  {isAira ? 'Dr. AIRA' : 'You'}
                </div>
              </div>

              {/* Patient icon */}
              {!isAira && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2 justify-start"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="bg-violet-950/60 border border-violet-500/20 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
