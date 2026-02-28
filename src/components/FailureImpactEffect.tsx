import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FailureImpactEffectProps {
    isTriggered: boolean;
}

export const FailureImpactEffect: React.FC<FailureImpactEffectProps> = ({ isTriggered }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isTriggered) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 2500); // Effect duration
            return () => clearTimeout(timer);
        }
    }, [isTriggered]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
                    {/* Screen Subtle Red Flash */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, times: [0, 0.3, 1] }}
                        className="absolute inset-0 bg-red-600/20"
                    />

                    {/* Red Upward Particle Burst */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    x: (Math.random() - 0.5) * 500,
                                    y: -Math.random() * 500 - 100
                                }}
                                transition={{
                                    duration: 1,
                                    ease: "easeOut",
                                    delay: Math.random() * 0.2
                                }}
                                className="absolute w-2 h-2 rounded-full bg-red-500 blur-[1px]"
                            />
                        ))}
                    </div>

                    {/* Camera Shake / Vibration - using a Framer Motion container at App level is better but we can shake the mascot separately */}
                </div>
            )}
        </AnimatePresence>
    );
};
