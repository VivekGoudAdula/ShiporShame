import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import { formatEther } from '../utils/contract';
import { ethers } from 'ethers';

interface RewardPoolProps {
  amount: bigint;
}

const ParticleSparks = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50, x: (Math.random() * 80 + 10) + '%' }}
          animate={{ opacity: [0, 1, 0], y: -200, scale: [1, 2, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 bg-rose-500 rounded-full blur-[2px]"
        />
      ))}
    </div>
  );
};

export const RewardPool = ({ amount }: RewardPoolProps) => {
  const [displayAmount, setDisplayAmount] = useState<number>(() => Number(ethers.formatEther(amount)));
  const [isIncreasing, setIsIncreasing] = useState(false);
  const prevAmountRef = useRef<bigint>(amount);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amountNumber = Number(ethers.formatEther(amount));

  const pressure = amountNumber < 1
    ? { label: 'LOW PRESSURE', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' }
    : amountNumber <= 3
      ? { label: 'RISING PRESSURE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' }
      : { label: 'DANGEROUS PRESSURE', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' };

  useEffect(() => {
    const target = Number(ethers.formatEther(amount));
    const previous = Number(ethers.formatEther(prevAmountRef.current));

    if (amount > prevAmountRef.current) {
      setIsIncreasing(true);
      const t = setTimeout(() => setIsIncreasing(false), 2500);
      prevAmountRef.current = amount;
      // No return here to allow counter to update
    } else {
      prevAmountRef.current = amount;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (Math.abs(target - previous) < 0.0001) {
      setDisplayAmount(target);
      return;
    }

    const DURATION = 1200;
    const STEPS = 60;
    const interval = DURATION / STEPS;
    const increment = (target - previous) / STEPS;
    let current = previous;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      current += increment;
      if (step >= STEPS) {
        setDisplayAmount(target);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setDisplayAmount(current);
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [amount]);

  return (
    <motion.div
      key="reward-pool"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: isIncreasing ? [1, 1.1, 1] : 1,
        boxShadow: isIncreasing ? '0 0 40px rgba(244, 63, 94, 0.3)' : '0 0 50px rgba(245,158,11,0.05)'
      }}
      transition={{
        scale: { duration: 0.4, times: [0, 0.5, 1], ease: "easeOut" },
        boxShadow: { duration: 0.6 }
      }}
      className="p-10 rounded-[40px] glass-panel relative overflow-hidden group border-amber-500/20 shadow-xl shadow-amber-500/5"
      data-reward-pool="true"
    >
      <AnimatePresence>
        {isIncreasing && <ParticleSparks />}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Center flame glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-4 mb-10 relative z-10">
        <motion.div
          animate={isIncreasing ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10"
        >
          <Flame className={`text-amber-500 ${isIncreasing ? 'animate-none' : 'animate-pulse'}`} size={32} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Reward Pool</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${amountNumber < 1 ? 'bg-emerald-500' : amountNumber <= 3 ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <p className="text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase font-black">Community Pressure Rising</p>
          </div>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-[0.3em] font-black">Total Stakes Liquidated</p>
        <div className="flex items-baseline gap-4">
          <motion.span
            className="text-7xl font-black tracking-tighter text-slate-900 tabular-nums inline-block"
          >
            {displayAmount.toFixed(2)}
          </motion.span>
          <span className="text-2xl font-black text-amber-500/40 tracking-widest">MON</span>
        </div>
      </div>

      {/* Pressure Level Indicator */}
      <motion.div
        layout
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${pressure.bg} ${pressure.border} border ${pressure.glow} mb-10 relative z-10 transition-colors duration-500`}
      >
        <div className={`w-2 h-2 rounded-full ${pressure.color.replace('text', 'bg')} animate-pulse`} />
        <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${pressure.color}`}>{pressure.label}</span>
      </motion.div>

      <div className="flex items-center justify-between relative z-10 p-5 rounded-3xl bg-amber-50 border border-amber-100">
        <div className="flex items-center gap-3 text-amber-600">
          <TrendingUp size={20} />
          <span className="text-xs font-black tracking-widest uppercase">Growth Rate: Volatile</span>
        </div>
        <AnimatePresence>
          {isIncreasing && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2 text-amber-500"
            >
              <AlertTriangle size={18} className="animate-bounce" />
              <span className="text-[10px] font-black">NEW LIQUIDATION 💀</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
