// components/aira/VideoFeed.jsx
// Optional webcam feed tile. Gracefully hides if camera permission is denied.
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoOff, Video } from 'lucide-react';

export default function VideoFeed({ enabled = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | active | denied | error

  useEffect(() => {
    if (!enabled) {
      stopStream();
      setStatus('idle');
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('active');
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      }
    }

    startCamera();
    return () => stopStream();
  }, [enabled]);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  if (!enabled || status === 'denied' || status === 'error') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{ width: 180, height: 135 }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Camera active indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white/60 font-mono">LIVE</span>
        </div>

        {/* Label */}
        <div className="absolute bottom-2 left-2 text-[10px] text-white/50 font-mono uppercase tracking-wider flex items-center gap-1">
          <Video className="w-3 h-3" />
          Patient
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
