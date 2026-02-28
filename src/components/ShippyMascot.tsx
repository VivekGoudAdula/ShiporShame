import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export type ShippyState = 'neutral' | 'happy' | 'angry' | 'concerned' | 'shipping' | 'streak' | 'failed';

interface ShippyMascotProps {
  state?: ShippyState;
  className?: string;
}

export const ShippyMascot = ({ state = 'neutral', className }: ShippyMascotProps) => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  // Springs for smooth movement
  const springConfig = { stiffness: 120, damping: 30 };

  // Gaze tracking for the large eyes - Global Hero-level tracking
  const eyeX = useSpring(useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-12, 12]), springConfig);
  const eyeY = useSpring(useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-10, 10]), springConfig);

  // Subtle Body rotation based on mouse
  const rotateX = useSpring(useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-15, 15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none ${className}`}>
      {/* Ambient Glow behind the cat */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-[-100px] blur-[100px] rounded-full bg-indigo-600/20 z-0"
      />

      <motion.div
        className="relative z-10 w-full h-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 200 220" className="w-full h-full overflow-visible drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          <defs>
            <radialGradient id="bodyGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>
            <filter id="eyeGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Refined Realistic Ears (Pointed, layered like image) */}
          <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} style={{ originX: "65px", originY: "60px" }}>
            <path d="M40 60 L10 10 L75 45 Z" fill="#1e1b4b" stroke="#6d28d9" strokeWidth="4" strokeLinejoin="round" />
            <path d="M45 55 L20 20 L65 42 Z" fill="#ca8dfc" opacity="0.15" />
          </motion.g>
          <motion.g animate={{ rotate: [2, -2, 2] }} transition={{ duration: 4.2, repeat: Infinity, delay: 0.1 }} style={{ originX: "135px", originY: "60px" }}>
            <path d="M160 60 L190 10 L125 45 Z" fill="#1e1b4b" stroke="#6d28d9" strokeWidth="4" strokeLinejoin="round" />
            <path d="M155 55 L180 20 L135 42 Z" fill="#ca8dfc" opacity="0.15" />
          </motion.g>

          {/* Refined Thick Curved Tail (like image) */}
          <motion.path
            d="M175 140 Q215 140 195 200"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="24"
            strokeLinecap="round"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "175px", originY: "140px" }}
          />

          {/* Main Round Body */}
          <circle cx="100" cy="110" r="85" fill="url(#bodyGradient)" />

          {/* Large Glowing Eyes with Global Tracking */}
          <motion.g style={{ x: eyeX, y: eyeY }}>
            {/* Outer Eye Glow */}
            <circle cx="65" cy="110" r="32" fill="#14b8a6" opacity="0.65" filter="url(#eyeGlow)" />
            <circle cx="135" cy="110" r="32" fill="#14b8a6" opacity="0.65" filter="url(#eyeGlow)" />

            {/* Pupil */}
            <circle cx="65" cy="110" r="22" fill="#000" />
            <circle cx="135" cy="110" r="22" fill="#000" />

            {/* Realistic Shine Highlights */}
            <circle cx="55" cy="100" r="8" fill="#fff" opacity="0.95" />
            <circle cx="125" cy="100" r="8" fill="#fff" opacity="0.95" />
            <circle cx="78" cy="122" r="4" fill="#fff" opacity="0.6" />
            <circle cx="148" cy="122" r="4" fill="#fff" opacity="0.6" />
          </motion.g>

          {/* Whiskers (Pink) */}
          <g stroke="#fda4af" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
            <line x1="25" y1="120" x2="-35" y2="105" />
            <line x1="25" y1="135" x2="-35" y2="135" />
            <line x1="25" y1="150" x2="-35" y2="165" />

            <line x1="175" y1="120" x2="235" y2="105" />
            <line x1="175" y1="135" x2="235" y2="135" />
            <line x1="175" y1="150" x2="235" y2="165" />
          </g>

          {/* Paws */}
          <ellipse cx="65" cy="190" rx="20" ry="12" fill="#1e1b4b" opacity="0.9" />
          <ellipse cx="135" cy="190" rx="20" ry="12" fill="#1e1b4b" opacity="0.9" />

          {/* Small Pink Nose */}
          <ellipse cx="100" cy="140" rx="7" ry="6" fill="#fda4af" />

          {/* Mouth */}
          <path d="M90 152 Q100 162 110 152" fill="none" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Speech Bubble - Text Only */}
      <motion.div
        className="absolute -top-20 -right-20 px-0 py-0 text-[15px] font-black text-slate-900 whitespace-nowrap z-20 pointer-events-none transition-all drop-shadow-[0_4px_12px_rgba(30,27,75,0.1)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        key={state}
      >
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
          {state === 'happy' ? "ELITE SHIP! 🚀" :
            state === 'angry' ? "STAKE BURNED... 🔥" :
              "READY TO DOMINATE?"}
        </span>
      </motion.div>
    </div>
  );
};
