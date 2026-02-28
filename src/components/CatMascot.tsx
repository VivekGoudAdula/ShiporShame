import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

export type CatReaction = 'happy' | 'thinking' | 'surprised' | 'neutral' | 'angry' | 'concerned' | 'streak' | 'failed' | 'sad';

interface CatMascotProps {
    isGenerating: boolean;
    reaction?: CatReaction;
    soundEnabled?: boolean;
    className?: string;
    size?: number;
    mode?: 'overlay' | 'mascot' | 'both' | 'floating';
}

// ══ Scroll-Triggered Floating Mascot ══
const ScrollMascot: React.FC<{ reaction?: CatReaction }> = ({ reaction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [targetPos, setTargetPos] = useState<{ x: number, y: number } | null>(null);
    const [isTouching, setIsTouching] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            setIsVisible(scrollPercent > 0.1);
        };

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const button = target.closest('button');

            if (button && isVisible) {
                const rect = button.getBoundingClientRect();
                setTargetPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
                setIsTouching(true);

                // Return to base after a delay
                setTimeout(() => {
                    setIsTouching(false);
                    setTargetPos(null);
                }, 1000);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousedown', handleGlobalClick);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -500, rotate: 720, opacity: 0, x: 0 }}
                    animate={isTouching && targetPos ? {
                        x: targetPos.x - 60, // Offset to "touch"
                        y: targetPos.y - window.innerHeight + 60, // Offset relative to fixed bottom
                        rotate: 0,
                        opacity: 1,
                        scale: 0.8
                    } : {
                        y: 0,
                        x: 0,
                        rotate: -5,
                        opacity: 1,
                        scale: 1
                    }}
                    exit={{ y: 500, rotate: -720, opacity: 0 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: isTouching ? 200 : 100,
                        damping: 20,
                        duration: 0.8
                    }}
                    className="fixed bottom-8 left-8 z-[200] cursor-pointer drop-shadow-2xl origin-center"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="relative group">
                        <AnimatePresence>
                            {!isTouching && (
                                <motion.div
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                >
                                    To the top? 😸
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <MascotSVG reaction={isTouching ? 'happy' : reaction} size={120} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ══ Cinematic Realistic 3D SVG Cat Mascot ══
export const MascotSVG: React.FC<{ reaction?: CatReaction, size?: number, className?: string }> = ({ reaction = 'neutral', size = 256, className }) => {
    const [blink, setBlink] = useState(0); // 0: open, 1: closed
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate distance and angle
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 8); // Max 8px offset

            setMousePos({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const triggerBlink = () => {
            setBlink(1);
            setTimeout(() => setBlink(0), 120);

            // Occasional double blink
            if (Math.random() > 0.8) {
                setTimeout(() => {
                    setBlink(1);
                    setTimeout(() => setBlink(0), 100);
                }, 250);
            }

            setTimeout(triggerBlink, 3000 + Math.random() * 4000);
        };
        const timer = setTimeout(triggerBlink, 2000);
        return () => clearTimeout(timer);
    }, []);

    const colors = {
        body: '#08081A',
        bodyGlow: '#121235',
        eyeOuter: '#7C3AED',  // Purple-700
        eyeInner: '#C4B5FD',  // Purple-300 highlight
        eyePupil: '#010105',
        nose: '#FF4081',
        whisker: '#FF80AB',
        earInner: '#1A1A3F'
    };

    const variantColors = useMemo(() => {
        switch (reaction) {
            case 'happy': return { glow: 'rgba(16, 185, 129, 0.4)' };
            case 'angry': return { glow: 'rgba(239, 68, 68, 0.4)' };
            case 'sad': return { glow: 'rgba(59, 130, 246, 0.4)' };
            case 'concerned': return { glow: 'rgba(245, 158, 11, 0.4)' };
            default: return { glow: 'rgba(124, 58, 237, 0.2)' };
        }
    }, [reaction]);

    return (
        <motion.div
            ref={containerRef}
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            animate={
                reaction === 'angry' ? { x: [-1, 1.5, -1, 1.5, 0], y: [0, -1, 1.5, -1, 0] } :
                    reaction === 'happy' ? { y: [0, -12, 0], scale: [1, 1.03, 1] } :
                        reaction === 'concerned' ? { x: [-1, 1, -1] } :
                            { y: [1.5, -1.5, 1.5] }
            }
            transition={
                reaction === 'angry' ? { duration: 0.1, repeat: 2 } :
                    reaction === 'happy' ? { duration: 0.4, repeat: 0, ease: "easeOut" } :
                        reaction === 'concerned' ? { duration: 0.2, repeat: Infinity } :
                            { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
        >
            {/* Ambient Aura */}
            <motion.div
                className="absolute inset-0 blur-[60px] rounded-full -z-10"
                style={{ background: variantColors.glow }}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                <defs>
                    <radialGradient id="bodyGrad" cx="40%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#1A1A45" />
                        <stop offset="45%" stopColor="#0A0A25" />
                        <stop offset="100%" stopColor="#020208" />
                    </radialGradient>

                    <radialGradient id="eyeIris" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor={colors.eyeInner} />
                        <stop offset="60%" stopColor={colors.eyeOuter} />
                        <stop offset="100%" stopColor="#3B0764" />
                    </radialGradient>

                    <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                        <stop offset="50%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    <filter id="eyeGlow">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* ══ Tail ══ */}
                <motion.path
                    d="M172 140 Q205 140 195 100"
                    stroke="#0A0A25"
                    strokeWidth="18"
                    fill="none"
                    strokeLinecap="round"
                    animate={{ rotate: [0, 8, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originX: '172px', originY: '140px' }}
                />

                {/* ══ Ears (Twitchy) ══ */}
                <motion.g animate={{ rotate: [0, 1, 0, -1, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                    {/* Left Ear */}
                    <path d="M42 65 L22 8 L82 55 Z" fill="#0A0A25" />
                    <path d="M48 60 L32 25 L75 52 Z" fill={colors.earInner} opacity="0.4" />
                    {/* Right Ear */}
                    <path d="M158 65 L178 8 L118 55 Z" fill="#0A0A25" />
                    <path d="M152 60 L168 25 L125 52 Z" fill={colors.earInner} opacity="0.4" />
                </motion.g>

                {/* ══ Main Spherical Body ══ */}
                <circle cx="100" cy="110" r="88" fill="url(#bodyGrad)" />
                <circle cx="100" cy="110" r="88" fill="url(#rimLight)" />

                {/* ══ Paws ══ */}
                <circle cx="62" cy="182" r="22" fill="#02020A" />
                <circle cx="138" cy="182" r="22" fill="#02020A" />

                {/* ══ Realistic Glowing Eyes ══ */}
                <motion.g
                    filter="url(#eyeGlow)"
                    animate={reaction === 'sad' ? { scale: 0.96, y: 2 } : {}}
                >
                    {/* Left Eye — perfectly round when open */}
                    <mask id="eyeMaskL">
                        <circle cx="68" cy="100" r="40" fill="white" />
                        <motion.rect
                            x="20" width="100" height="120" fill="black"
                            animate={{ y: blink ? 62 : -200 }}
                            transition={{ duration: 0.1, ease: "easeInOut" }}
                        />
                    </mask>
                    <circle cx="68" cy="100" r="40" fill="url(#eyeIris)" mask="url(#eyeMaskL)" />
                    <motion.circle
                        cx="68" cy="100" r="24"
                        fill={colors.eyePupil}
                        mask="url(#eyeMaskL)"
                        animate={{ x: mousePos.x, y: mousePos.y }}
                        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                    />

                    {/* Right Eye — perfectly round when open */}
                    <mask id="eyeMaskR">
                        <circle cx="132" cy="100" r="40" fill="white" />
                        <motion.rect
                            x="80" width="100" height="120" fill="black"
                            animate={{ y: blink ? 62 : -200 }}
                            transition={{ duration: 0.1, ease: "easeInOut" }}
                        />
                    </mask>
                    <circle cx="132" cy="100" r="40" fill="url(#eyeIris)" mask="url(#eyeMaskR)" />
                    <motion.circle
                        cx="132" cy="100" r="24"
                        fill={colors.eyePupil}
                        mask="url(#eyeMaskR)"
                        animate={{ x: mousePos.x, y: mousePos.y }}
                        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                    />

                    {/* Reflections */}
                    <motion.g
                        opacity={blink ? 0 : 0.9}
                        style={{ transition: 'opacity 0.08s' }}
                        animate={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
                    >
                        <circle cx="78" cy="86" r="8" fill="white" />
                        <circle cx="84" cy="98" r="3" fill="white" />
                        <circle cx="142" cy="86" r="8" fill="white" />
                        <circle cx="148" cy="98" r="3" fill="white" />
                    </motion.g>
                </motion.g>

                {/* ══ Face Details ══ */}
                <motion.g animate={reaction === 'sad' ? { y: 3 } : {}}>
                    {/* Nose */}
                    <circle cx="100" cy="144" r="6" fill={colors.nose} filter="blur(0.5px)" />

                    {/* Small Realistic Smile */}
                    <path
                        d={reaction === 'happy' ? "M92 154 Q100 162 108 154" : "M94 156 Q100 160 106 156"}
                        stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"
                    />

                    {/* Long Whisker Setup */}
                    <g stroke={colors.whisker} strokeWidth="2" strokeLinecap="round" opacity="0.5">
                        <line x1="45" y1="125" x2="5" y2="115" />
                        <line x1="45" y1="135" x2="2" y2="135" />
                        <line x1="45" y1="145" x2="8" y2="155" />

                        <line x1="155" y1="125" x2="195" y2="115" />
                        <line x1="155" y1="135" x2="198" y2="135" />
                        <line x1="155" y1="145" x2="192" y2="155" />
                    </g>
                </motion.g>
            </svg>
            {/* Sparkle particles for Happy state */}
            {reaction === 'happy' && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: (Math.random() - 0.5) * 150, y: (Math.random() - 0.5) * 150 }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export const CatMascot: React.FC<CatMascotProps> = ({ isGenerating, reaction, soundEnabled, className, size, mode = 'both' }) => {
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
        setLoadingMsg(0);
        const interval = setInterval(() => {
            setLoadingMsg(prev => (prev + 1) % loadingMessages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, [isGenerating]);

    return (
        <>
            {/* Standalone Mascot */}
            {(mode === 'both' || mode === 'mascot' || mode === 'floating') && !isGenerating && (
                mode === 'floating' ? <ScrollMascot reaction={reaction} /> : <MascotSVG reaction={reaction} size={size} className={className} />
            )}

            {/* Loading Overlay */}
            <AnimatePresence>
                {(mode === 'both' || mode === 'overlay') && isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none backdrop-blur-2xl bg-black/40"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="flex flex-col items-center gap-12"
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 rounded-full blur-3xl opacity-30"
                                    style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)' }}
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <MascotSVG reaction="happy" size={320} />
                                <div className="absolute bottom-6 right-6 flex gap-1.5 bg-purple-600/90 rounded-full px-4 py-2 border border-purple-400/30">
                                    {[0, 1, 2].map(i => (
                                        <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center space-y-4">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={loadingMsg}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className="text-2xl font-black text-white tracking-tight"
                                    >
                                        {loadingMessages[loadingMsg]}
                                    </motion.p>
                                </AnimatePresence>
                                <p className="text-xs font-mono text-purple-300 uppercase tracking-[0.4em] font-bold opacity-60">AI Protocol Synchronization</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
