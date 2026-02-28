import React from 'react';
import { motion } from 'motion/react';

export const CyberBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#f8fafc]">
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Grid Floor */}
      <div className="grid-floor opacity-10" />
      
      {/* Floating Light Blobs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[120px] rounded-full"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating Particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] bg-slate-400/20 rounded-full"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 110 + '%',
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-50 opacity-5" />
    </div>
  );
};
