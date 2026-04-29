// components/aira/AIRAAvatarPulse.jsx
// Animated avatar that reacts to AIRA's state: idle | listening | thinking | speaking
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATE_COLORS = {
  idle:      { ring: '#6366f1', glow: 'rgba(99,102,241,0.3)',  label: 'Dr. AIRA' },
  listening: { ring: '#22d3ee', glow: 'rgba(34,211,238,0.4)',  label: 'Listening…' },
  thinking:  { ring: '#a78bfa', glow: 'rgba(167,139,250,0.4)', label: 'Thinking…' },
  speaking:  { ring: '#34d399', glow: 'rgba(52,211,153,0.4)',  label: 'Speaking…' },
  alert:     { ring: '#f87171', glow: 'rgba(248,113,113,0.5)', label: '⚠ Alert' },
};

export default function AIRAAvatarPulse({ state = 'idle', size = 160 }) {
  const { ring, glow, label } = STATE_COLORS[state] || STATE_COLORS.idle;
  const isAnimated = state !== 'idle';

  return (
    <div className="flex flex-col items-center gap-3 select-none" style={{ width: size }}>
      {/* Outer pulsing rings */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

        {/* Ring 3 — outermost, slow pulse */}
        {isAnimated && (
          <motion.div
            className="absolute rounded-full border"
            style={{ width: size, height: size, borderColor: ring, opacity: 0.15 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Ring 2 — mid pulse */}
        {isAnimated && (
          <motion.div
            className="absolute rounded-full border"
            style={{ width: size * 0.82, height: size * 0.82, borderColor: ring, opacity: 0.25 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.05, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        )}

        {/* Core circle */}
        <motion.div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            background: `radial-gradient(circle at 35% 35%, ${ring}44, ${ring}11)`,
            border: `2px solid ${ring}88`,
            boxShadow: `0 0 ${size * 0.25}px ${glow}, inset 0 0 ${size * 0.15}px ${ring}22`,
          }}
          animate={
            state === 'speaking'
              ? { scale: [1, 1.06, 1, 1.04, 1] }
              : state === 'thinking'
              ? { rotate: [0, 360] }
              : { scale: 1 }
          }
          transition={
            state === 'speaking'
              ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
              : state === 'thinking'
              ? { duration: 3, repeat: Infinity, ease: 'linear' }
              : {}
          }
        >
          {/* AIRA initials / icon */}
          <div className="text-center z-10">
            <div
              className="font-bold tracking-widest"
              style={{ fontSize: size * 0.17, color: ring, letterSpacing: '0.15em' }}
            >
              AIRA
            </div>
            <div style={{ fontSize: size * 0.08, color: `${ring}99`, marginTop: 2 }}>
              AI MD
            </div>
          </div>

          {/* Inner shimmer for thinking */}
          {state === 'thinking' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${ring}33, transparent)`,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>

        {/* Listening bars — sound wave animation */}
        {state === 'listening' && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-[3px]"
            style={{ bottom: size * 0.08 }}
          >
            {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: 3, backgroundColor: ring }}
                animate={{ height: [`${h * 12}px`, `${h * 22}px`, `${h * 12}px`] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-mono tracking-widest uppercase"
          style={{ color: ring }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
