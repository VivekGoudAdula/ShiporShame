import React from 'react';
import { motion } from 'motion/react';

export const BackgroundLayer = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0b0b12]">
            {/* Layer 1: Dark Gradient Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b12] to-[#14142a]" />

            {/* Layer 2: Blurred Radial Purple Glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }}
            />

            {/* Layer 3: Slow Moving Gradient Mesh Animation */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    background: 'radial-gradient(at 0% 0%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168,85,247,0.15) 0px, transparent 50%)'
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Layer 4: Floating Particles */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{
                        width: Math.random() * 4 + 1,
                        height: Math.random() * 4 + 1,
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [-20, -120, -20],
                        opacity: [0, 0.4, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 10
                    }}
                />
            ))}

            {/* Layer 5: Subtle Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        </div>
    );
};
