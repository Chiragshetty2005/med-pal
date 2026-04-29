// components/aira/AIRAFace.jsx
// Animated AI doctor face — SVG + Framer Motion
// States: idle | listening | thinking | speaking | alert

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const HAIR = '#0c1020';
const COAT = '#d8e4f8';

const STATE_CONFIG = {
  idle:      { glow: '#6366f1', iris: '#5080e8', label: 'Dr. AIRA' },
  listening: { glow: '#22d3ee', iris: '#20c0e0', label: 'Listening…' },
  thinking:  { glow: '#a78bfa', iris: '#9070e0', label: 'Processing…' },
  speaking:  { glow: '#34d399', iris: '#2ab888', label: 'Speaking…' },
  alert:     { glow: '#f87171', iris: '#e04040', label: '⚠ Alert' },
};

export default function AIRAFace({ state = 'idle', className = '' }) {
  const [blinkProgress, setBlinkProgress] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const blinkTimer = useRef(null);
  const mouthTimer = useRef(null);

  const { glow, iris, label } = STATE_CONFIG[state] || STATE_CONFIG.idle;

  // ── Blink loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleBlink = () => {
      blinkTimer.current = setTimeout(() => {
        let t = 0;
        const anim = setInterval(() => {
          t += 16;
          if (t < 120) setBlinkProgress(t / 120);
          else if (t < 240) setBlinkProgress((240 - t) / 120);
          else { setBlinkProgress(0); clearInterval(anim); scheduleBlink(); }
        }, 16);
      }, 3000 + Math.random() * 3000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer.current);
  }, []);

  // ── Mouth animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(mouthTimer.current);
    if (state !== 'speaking') { setMouthOpen(0); return; }
    mouthTimer.current = setInterval(() => {
      setMouthOpen(Math.random() < 0.35 ? 0.05 : Math.random() * 0.85 + 0.1);
    }, 90 + Math.random() * 70);
    return () => clearInterval(mouthTimer.current);
  }, [state]);

  const eyeOff = {
    idle: {x:0,y:0}, listening: {x:2,y:1}, thinking: {x:-4,y:-3},
    speaking: {x:0,y:0}, alert: {x:0,y:0},
  }[state] || {x:0,y:0};

  const browY = { idle:0, listening:-3, thinking:3, speaking:-1, alert:4 }[state] || 0;

  const jawDrop   = mouthOpen * 12;
  const teethShow = Math.max(0, mouthOpen * 9 - 3);

  // ── Subcomponents ────────────────────────────────────────────────────────────
  const Eye = ({ cx, gradId }) => (
    <g>
      <ellipse cx={cx} cy={200} rx={30} ry={26} fill="rgba(60,50,100,0.2)" />
      <ellipse cx={cx} cy={200} rx={26} ry={22} fill="white" />
      <motion.circle cx={cx} cy={200} r={15} fill={`url(#${gradId})`}
        animate={{ cx: cx + eyeOff.x, cy: 200 + eyeOff.y }} transition={{ duration: 0.3 }} />
      <motion.circle cx={cx} cy={200} r={7.5} fill="#050a18"
        animate={{ cx: cx + eyeOff.x, cy: 200 + eyeOff.y }} transition={{ duration: 0.3 }} />
      <motion.circle cx={cx - 6} cy={194} r={3.5} fill="rgba(255,255,255,0.95)"
        animate={{ cx: cx - 6 + eyeOff.x * 0.5, cy: 194 + eyeOff.y * 0.5 }} transition={{ duration: 0.3 }} />
      <motion.circle cx={cx} cy={200} r={15} fill="none" stroke={iris} strokeWidth={1.5} opacity={0.5}
        animate={{ cx: cx + eyeOff.x, cy: 200 + eyeOff.y }} transition={{ duration: 0.3 }} />
      {/* Blink lid */}
      <ellipse cx={cx} cy={200} rx={26} ry={22 * blinkProgress} fill="url(#aira-skin)" />
    </g>
  );

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Ambient glow */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{
          width: 310, height: 370, borderRadius: '50% / 50%',
          border: `2px solid ${glow}55`,
          boxShadow: `0 0 50px ${glow}44, 0 0 100px ${glow}22`,
        }}
        animate={state === 'speaking'
          ? { boxShadow: [`0 0 40px ${glow}33,0 0 80px ${glow}11`, `0 0 80px ${glow}99,0 0 160px ${glow}44`, `0 0 40px ${glow}33,0 0 80px ${glow}11`] }
          : {}}
        transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle head bob */}
      <motion.svg width={300} height={360} viewBox="0 0 400 480" fill="none"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: state === 'idle' ? 4.5 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="aira-skin" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#d0dcf4" />
            <stop offset="60%" stopColor="#b4c6e8" />
            <stop offset="100%" stopColor="#7080a8" />
          </radialGradient>
          <radialGradient id="aira-iris-l" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#9dd8ff" /><stop offset="100%" stopColor={iris} />
          </radialGradient>
          <radialGradient id="aira-iris-r" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#9dd8ff" /><stop offset="100%" stopColor={iris} />
          </radialGradient>
          <filter id="eye-glow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background disc */}
        <ellipse cx={200} cy={240} rx={175} ry={210} fill="rgba(8,5,25,0.65)" />

        {/* Face */}
        <ellipse cx={200} cy={255} rx={145} ry={185} fill="url(#aira-skin)" />

        {/* Hair */}
        <ellipse cx={200} cy={93} rx={148} ry={83} fill={HAIR} />
        <rect x={52} y={93} width={296} height={68} fill={HAIR} />
        <path d="M52 158 Q45 200 52 262 Q63 240 68 212 L68 158Z" fill={HAIR} />
        <path d="M348 158 Q355 200 348 262 Q337 240 332 212 L332 158Z" fill={HAIR} />

        {/* Ears */}
        <ellipse cx={56} cy={225} rx={14} ry={22} fill="#b4c6e8" />
        <ellipse cx={344} cy={225} rx={14} ry={22} fill="#b4c6e8" />
        <ellipse cx={59} cy={225} rx={7} ry={12} fill="#7080a8" opacity={0.35} />
        <ellipse cx={341} cy={225} rx={7} ry={12} fill="#7080a8" opacity={0.35} />

        {/* Forehead highlight */}
        <ellipse cx={185} cy={168} rx={42} ry={22} fill="rgba(255,255,255,0.07)" />

        {/* Eyebrows */}
        <motion.path d="M110 170 Q142 158 172 163" stroke={HAIR} strokeWidth={5.5}
          strokeLinecap="round" fill="none"
          animate={{ translateY: browY }} transition={{ duration: 0.4 }} />
        <motion.path d="M228 163 Q258 158 290 170" stroke={HAIR} strokeWidth={5.5}
          strokeLinecap="round" fill="none"
          animate={{ translateY: browY }} transition={{ duration: 0.4 }} />

        {/* Eyes */}
        <g filter="url(#eye-glow)">
          <Eye cx={145} gradId="aira-iris-l" />
          <Eye cx={255} gradId="aira-iris-r" />
        </g>

        {/* Nose */}
        <path d="M200 226 C196 246 186 260 181 268 Q200 274 219 268 C214 260 204 246 200 226"
          fill="rgba(80,70,130,0.12)" stroke="rgba(80,70,130,0.2)" strokeWidth={1.5} />
        <ellipse cx={200} cy={268} rx={12} ry={6} fill="rgba(255,255,255,0.05)" />

        {/* Cheeks blush */}
        <ellipse cx={115} cy={256} rx={30} ry={18} fill={`${iris}1a`} />
        <ellipse cx={285} cy={256} rx={30} ry={18} fill={`${iris}1a`} />

        {/* Mouth */}
        <g transform="translate(200,300)">
          <motion.ellipse cx={0} cy={4} rx={33} fill="#06020f"
            animate={{ ry: jawDrop }} transition={{ duration: 0.08 }} />
          <motion.ellipse cx={0} cy={2} rx={26} fill="rgba(240,240,255,0.85)"
            animate={{ ry: teethShow }} transition={{ duration: 0.08 }} />
          <path d="M-33 0 Q-16 -9 0 -6 Q16 -9 33 0"
            stroke="#9080b8" strokeWidth={3.5} strokeLinecap="round" fill="rgba(144,128,184,0.3)" />
          <motion.path d="M-33 0 Q-16 10 0 12 Q16 10 33 0"
            stroke="#9080b8" strokeWidth={3.5} strokeLinecap="round" fill="rgba(144,128,184,0.15)"
            animate={{ translateY: jawDrop }} transition={{ duration: 0.08 }} />
          <circle cx={-33} cy={0} r={2.5} fill="#9080b8" opacity={0.6} />
          <circle cx={33} cy={0} r={2.5} fill="#9080b8" opacity={0.6} />
        </g>

        {/* Neck + coat */}
        <rect x={170} y={432} width={60} height={50} rx={8} fill="#b4c6e8" />
        <path d="M30 480 Q90 450 170 440 L200 462 L230 440 Q310 450 370 480Z" fill={COAT} />
        <path d="M170 440 Q185 448 200 462 L194 480 H155 L115 480 Q95 465 85 452Z" fill={COAT} />
        <path d="M230 440 Q215 448 200 462 L206 480 H245 L285 480 Q305 465 315 452Z" fill={COAT} />
        {/* stethoscope hint */}
        <path d="M148 454 Q158 446 168 450 Q174 455 168 462"
          stroke="#8090a8" strokeWidth={3} fill="none" strokeLinecap="round" />

        {/* HUD corner brackets */}
        <g stroke={glow} strokeWidth={2} opacity={0.35}>
          <path d="M30 52 L30 80 M30 52 L58 52" />
          <path d="M370 52 L370 80 M370 52 L342 52" />
          <path d="M30 422 L30 394 M30 422 L58 422" />
          <path d="M370 422 L370 394 M370 422 L342 422" />
        </g>

        {/* Scan lines */}
        {[0,1,2,3,4,5].map(i => (
          <motion.line key={i} x1={55} y1={80 + i * 58} x2={345} y2={80 + i * 58}
            stroke={glow} strokeWidth={0.5}
            animate={{ opacity: [0, 0.08, 0], translateY: [0, 8] }}
            transition={{ duration: 3.5, delay: i * 0.5, repeat: Infinity, ease: 'linear' }} />
        ))}
      </motion.svg>

      {/* State label */}
      <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase"
        style={{ color: glow, background: `${glow}18`, border: `1px solid ${glow}35` }}>
        <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: glow }}
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        {label}
      </div>
    </div>
  );
}
