import React from 'react';
import { motion } from 'motion/react';

export type ShippyState = 'neutral' | 'happy' | 'angry' | 'concerned' | 'shipping' | 'streak' | 'failed';

interface ShippyMascotProps {
  state?: ShippyState;
  className?: string;
  isHighPressure?: boolean;
}

export const ShippyMascot = ({ state = 'neutral', className, isHighPressure }: ShippyMascotProps) => {
  const [blink, setBlink] = React.useState(false);

  React.useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, state === 'concerned' ? 2000 : 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [state]);

  const getGlowColor = () => {
    switch (state) {
      case 'happy': return 'bg-emerald-500/30 shadow-emerald-500/20';
      case 'angry': return 'bg-rose-500/30 shadow-rose-500/20';
      case 'concerned': return 'bg-amber-500/30 shadow-amber-500/20';
      case 'streak': return 'bg-orange-500/40 shadow-orange-500/30';
      default: return 'bg-purple-500/20 shadow-purple-500/10';
    }
  };

  const mascotColor = state === 'angry' ? '#f43f5e' : state === 'happy' ? '#10b981' : state === 'concerned' ? '#f59e0b' : '#8b5cf6';

  return (
    <div className={`relative w-32 h-32 ${className}`}>
      {/* Spotlight behind mascot */}
      <motion.div
        animate={{ scale: [1.2, 1.5, 1.2], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 blur-[60px] rounded-full transition-colors duration-700 ${getGlowColor()}`}
      />

      <motion.div
        className="w-full h-full relative z-10"
        animate={
          state === 'happy' ? { y: [0, -20, 0], scale: [1, 1.1, 1] } :
            state === 'angry' ? { x: [-2, 2, -2, 2, 0] } :
              state === 'concerned' ? { y: [0, -4, 0] } :
                state === 'shipping' ? { rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] } :
                  state === 'streak' ? { scale: [1, 1.15, 1], y: [0, -15, 0] } :
                    state === 'failed' ? { rotate: [0, 180], y: [0, 50], opacity: [1, 0], scale: [1, 0.5] } :
                      { y: [0, -8, 0], scale: [1, 1.02, 1] } // neutral/idle
        }
        transition={{
          duration: (state as any) === 'neutral' ? 4 : state === 'happy' ? 0.4 : state === 'angry' ? 0.1 : state === 'failed' ? 0.8 : 4,
          repeat: state === 'failed' ? 0 : Infinity,
          ease: state === 'happy' ? "easeOut" : "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]">
          {/* Tail */}
          <motion.path
            d="M85 70 Q95 60 85 50"
            stroke={mascotColor}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            animate={{ rotate: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: '85px', originY: '70px' }}
          />

          {/* Ears */}
          <path d="M20 30 L40 10 L45 35 Z" fill={mascotColor} className="transition-colors duration-500" />
          <path d="M80 30 L60 10 L55 35 Z" fill={mascotColor} className="transition-colors duration-500" />

          {/* Head */}
          <motion.circle
            cx="50" cy="50" r="35" fill={mascotColor}
            className="transition-colors duration-500"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Eyes */}
          <g>
            <circle cx="40" cy="45" r="4" fill="white" />
            <circle cx="60" cy="45" r="4" fill="white" />

            <motion.circle
              cx="40" cy="45" r="2" fill="black"
              animate={state === 'angry' ? { scaleY: 0.1, y: 1 } : blink ? { scaleY: 0.1 } : { scaleY: 1 }}
            />
            <motion.circle
              cx="60" cy="45" r="2" fill="black"
              animate={state === 'angry' ? { scaleY: 0.1, y: 1 } : blink ? { scaleY: 0.1 } : { scaleY: 1 }}
            />
          </g>

          {/* Nose */}
          <path d="M48 55 L52 55 L50 58 Z" fill="#ff9999" />

          {/* Mouth */}
          <motion.path
            d={state === 'happy' || state === 'shipping' ? "M40 65 Q50 75 60 65" : state === 'angry' ? "M40 65 Q50 55 60 65" : "M45 62 Q50 67 55 62"}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Blush */}
          {(state === 'happy' || state === 'shipping') && (
            <>
              <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} cx="30" cy="55" r="3" fill="#ff9999" />
              <motion.circle initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} cx="70" cy="55" r="3" fill="#ff9999" />
            </>
          )}
        </svg>
      </motion.div>

      {/* Speech Bubble */}
      <motion.div
        className="absolute -top-10 -right-16 glass-panel px-4 py-2 rounded-2xl text-[10px] font-black text-slate-900 whitespace-nowrap shadow-xl border-white/10 backdrop-blur-md"
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        key={state}
      >
        {state === 'happy' ? "AMAZING SHIP! 🚢" :
          state === 'angry' ? "PROTOCOL FAILED... 💀" :
            state === 'concerned' ? "REWARD POOL IS HUGE! 😱" :
              state === 'shipping' ? "LFG! SHIP IT! 🚀" :
                state === 'streak' ? "ON FIRE! 🔥🔥🔥" :
                  "READY TO COMMIT?"}
      </motion.div>
    </div>
  );
};
