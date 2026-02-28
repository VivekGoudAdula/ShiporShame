import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins } from 'lucide-react';

interface CoinFlyEffectProps {
    isTriggered: boolean;
    startX: number;
    startY: number;
}

const COIN_COUNT = 4;

export const CoinFlyEffect: React.FC<CoinFlyEffectProps> = ({ isTriggered, startX, startY }) => {
    // Pre-generate random offsets so they are stable and don't re-calculate on each render
    const coins = useMemo(() => Array.from({ length: COIN_COUNT }, (_, i) => ({
        id: i,
        scatter: (Math.random() - 0.5) * 120,
        scatterY: -(60 + Math.random() * 80),
        delay: i * 0.07,
    })), []);

    // Find the reward pool element position at trigger time
    const targetX = useMemo(() => {
        if (!isTriggered) return 0;
        const el = document.querySelector('[data-reward-pool="true"]');
        if (el) {
            const rect = el.getBoundingClientRect();
            return rect.left + rect.width / 2;
        }
        return window.innerWidth * 0.75;
    }, [isTriggered]);

    const targetY = useMemo(() => {
        if (!isTriggered) return 0;
        const el = document.querySelector('[data-reward-pool="true"]');
        if (el) {
            const rect = el.getBoundingClientRect();
            return rect.top + rect.height / 2;
        }
        return 200;
    }, [isTriggered]);

    return (
        <AnimatePresence>
            {isTriggered && (
                <div className="fixed inset-0 z-[400] pointer-events-none">
                    {coins.map((coin) => (
                        <motion.div
                            key={coin.id}
                            initial={{
                                x: startX,
                                y: startY,
                                opacity: 1,
                                scale: 0.4,
                                rotate: 0,
                            }}
                            animate={{
                                x: [startX, startX + coin.scatter, targetX],
                                y: [startY, startY + coin.scatterY, targetY],
                                opacity: [0, 1, 1, 0],
                                scale: [0.4, 1.3, 0.9, 0.5],
                                rotate: [0, 180, 360 * 2],
                            }}
                            transition={{
                                duration: 1.4,
                                ease: 'easeInOut',
                                delay: coin.delay,
                                times: [0, 0.2, 0.8, 1],
                            }}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        >
                            <div className="bg-gradient-to-br from-amber-300 to-amber-500 rounded-full p-1.5 border-2 border-amber-200 shadow-xl shadow-amber-500/40">
                                <Coins size={20} className="text-amber-900" />
                            </div>
                            {/* Glow trail */}
                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-60 -z-10 scale-150" />
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};
