import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import catAnimation from '../public/animations/Catloader.json';
import meowSound from '../public/sounds/meow.mp3';
import { cn } from '../lib/utils';

interface CatMascotProps {
    isGenerating: boolean;
    reaction?: 'happy' | 'thinking' | 'surprised';
    soundEnabled: boolean;
}

export const CatMascot: React.FC<CatMascotProps> = ({ isGenerating, reaction, soundEnabled }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [loadingMsg, setLoadingMsg] = useState(0);

    const loadingMessages = [
        "🚀 Architecting your vision...",
        "Defining strategic milestones...",
        "🛡️ Identifying critical risks...",
        "💻 Structuring optimized tech stack...",
        "Your AI Co-Founder is finalizing your MVP roadmap...",
    ];

    useEffect(() => {
        if (!isGenerating) return;

        // Play meow sound when loading starts
        playMeow();

        setLoadingMsg(0);
        const interval = setInterval(() => {
            setLoadingMsg(prev => (prev + 1) % loadingMessages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, [isGenerating]);

    useEffect(() => {
        if (soundEnabled) {
            console.log('Initializing meow sound from:', meowSound);
            // Add a cache breaker to ensure we get the latest file
            const url = `${meowSound}${meowSound.includes('?') ? '&' : '?'}v=${Date.now()}`;
            audioRef.current = new Audio(url);
            audioRef.current.load();
        } else {
            audioRef.current = null;
        }
    }, [soundEnabled, meowSound]);

    const playMeow = () => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    };

    return (
        <>
            {/* ══ Loading Overlay ══ */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                        style={{ backdropFilter: 'blur(12px)', background: 'radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0.7) 100%)' }}
                    >
                        {/* Shimmering card overlay on the background */}
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="flex flex-col items-center gap-8"
                        >
                            {/* Cat typing animation */}
                            <div className="relative">
                                {/* Glow ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)' }}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                />

                                {/* Lottie Cat Animation - No Box Outline */}
                                <motion.div
                                    className="relative w-64 h-64 flex items-center justify-center overflow-hidden"
                                >
                                    <Lottie
                                        animationData={catAnimation}
                                        loop={true}
                                        className="w-full h-full scale-110"
                                    />
                                </motion.div>

                                {/* Typing dots */}
                                <motion.div
                                    className="absolute bottom-4 right-4 flex gap-1 bg-indigo-600 rounded-full px-3 py-1.5 shadow-lg"
                                >
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 bg-white rounded-full"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </motion.div>
                            </div>

                            {/* Loading message with animated transition */}
                            <div className="text-center space-y-2">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={loadingMsg}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.35 }}
                                        className="text-xl font-black text-slate-900 tracking-tight"
                                    >
                                        {loadingMessages[loadingMsg]}
                                    </motion.p>
                                </AnimatePresence>
                                <p className="text-sm text-slate-500 font-medium">Your AI Co-Founder is on it.</p>
                            </div>

                            {/* Shimmer bars (skeleton-like) */}
                            <div className="w-72 space-y-2.5">
                                {[100, 80, 65].map((w, i) => (
                                    <motion.div
                                        key={i}
                                        className="h-3 rounded-full bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100"
                                        style={{ width: `${w}%` }}
                                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
