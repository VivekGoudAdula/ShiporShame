import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import monadLogo from '../public/images/monlogo.png';
import shipOrShameLogo from '../public/images/logo.png';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [stage, setStage] = useState(1); // 1: Monad, 2: ShipOrShame
  const [isCollided, setIsCollided] = useState(false);

  useEffect(() => {
    if (stage === 1 && isCollided) {
      const timer = setTimeout(() => {
        setStage(2);
        setIsCollided(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (stage === 2 && isCollided) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, isCollided, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#f8fafc] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 2, filter: 'blur(40px)' }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {stage === 1 ? (
            <motion.div
              key="monad-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative flex items-center justify-center w-full h-full"
            >
              <motion.img
                src={monadLogo}
                className="w-32 h-32 md:w-48 md:h-48 z-10"
                initial={{ x: -1000, rotate: -720, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
              />

              <motion.img
                src={monadLogo}
                className="w-32 h-32 md:w-48 md:h-48 absolute z-10"
                initial={{ x: 1000, rotate: 720, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                onAnimationComplete={() => setIsCollided(true)}
              />

              <AnimatePresence>
                {isCollided && (
                  <motion.div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-1 h-1 bg-white rounded-full shadow-[0_0_100px_100px_rgba(255,255,255,1)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 500, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute w-64 h-64 bg-purple-500 rounded-full blur-[100px]"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 4, opacity: [0, 0.8, 0] }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isCollided && (
                  <motion.div
                    className="absolute z-30 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <h1 className="text-5xl font-black tracking-[0.8em] text-slate-900 ml-[0.8em]">MONAD</h1>
                    <p className="text-purple-600 font-mono text-sm mt-4 tracking-[0.5em] uppercase">Protocol Synchronized</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="sos-stage"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="relative flex flex-col items-center justify-center w-full h-full"
              onAnimationComplete={() => setIsCollided(true)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                  <motion.div
                    className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <img src={shipOrShameLogo} alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]" />
                </div>

                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 text-center">
                  SHIP<span className="text-purple-600">OR</span>SHAME
                </h2>
                <motion.div
                  className="h-1 w-24 bg-gradient-to-r from-purple-600 to-blue-600 mt-6 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 96 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                />
                <p className="text-slate-400 font-mono text-xs mt-6 tracking-[0.4em] uppercase">The ultimate commitment layer</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

