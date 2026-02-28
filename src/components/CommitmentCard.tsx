import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, User, Coins, CheckCircle2, XCircle, AlertCircle, Zap, Activity, Loader2 } from 'lucide-react';
import { Commitment, Status } from '../hooks/useContract';
import { formatAddress, formatEther } from '../utils/contract';
import { cn } from '../utils/cn';

interface CommitmentCardProps {
  commitment: Commitment;
  currentUser: string | null;
  onShip: (id: number) => Promise<void>;
  onFail: (id: number) => Promise<void>;
  onConnect: () => Promise<void>;
  loading: boolean;
}

// Pre-generate waveform heights once per card mount to avoid re-render jitter
const WAVEFORM_HEIGHTS = Array.from({ length: 20 }, () => 2 + Math.random() * 10);

export const CommitmentCard: React.FC<CommitmentCardProps> = ({ commitment, currentUser, onShip, onFail, onConnect, loading }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, commitment.deadline - now);
  });
  const [isExpired, setIsExpired] = useState(() => {
    return Math.floor(Date.now() / 1000) >= commitment.deadline;
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justShipped, setJustShipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable countdown — precise, no memory leaks
  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = commitment.deadline - now;
      if (diff <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setTimeLeft(diff);
      }
    };

    // Only run timer for Active commitments
    if (commitment.status === Status.Active) {
      tick(); // Initial call
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [commitment.deadline, commitment.status]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((centerX - x) / centerX) * 8;
    cardRef.current.style.setProperty('--rx', `${rotateX}deg`);
    cardRef.current.style.setProperty('--ry', `${rotateY}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCreator = currentUser?.toLowerCase() === commitment.creator.toLowerCase();
  const canShip = commitment.status === Status.Active && isCreator && !isExpired;
  // TriggerFail: only visible if Active AND expired, any connected user can trigger
  const canTriggerFail = commitment.status === Status.Active && isExpired;

  const handleAction = async (action: 'ship' | 'fail') => {
    if (!currentUser) {
      await onConnect();
      return;
    }

    setCardLoading(true);
    setActionError(null);
    try {
      if (action === 'ship') {
        await onShip(commitment.id);
        setJustShipped(true);
      } else {
        await onFail(commitment.id);
      }
    } catch (err: any) {
      const msg = err.message || 'Action failed. Please try again.';
      setActionError(msg.length > 120 ? msg.slice(0, 120) + '...' : msg);
    } finally {
      setCardLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (commitment.status) {
      case Status.Shipped:
        return {
          label: 'SHIPPED',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          icon: CheckCircle2,
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          animation: 'shine-sweep'
        };
      case Status.Failed:
        return {
          label: 'FAILED',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/40',
          icon: XCircle,
          glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]',
          animation: 'glitch-hover'
        };
      default:
        return isExpired
          ? {
            label: 'EXPIRED',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/40',
            icon: AlertCircle,
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
            animation: ''
          }
          : {
            label: 'ACTIVE',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/40',
            icon: Zap,
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
            animation: ''
          };
    }
  };

  const config = getStatusConfig();
  const isActionLoading = cardLoading || loading;

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: justShipped ? '0 0 60px rgba(16,185,129,0.4)' : undefined
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative p-8 rounded-[40px] glass-panel tilt-card group overflow-hidden border-2 transition-all duration-300",
        config.border,
        config.glow,
        config.animation
      )}
      data-commitment-id={commitment.id}
    >
      {/* Shipped success glow overlay */}
      <AnimatePresence>
        {justShipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/10 pointer-events-none z-20 rounded-[40px]"
          />
        )}
      </AnimatePresence>

      {/* Waveform Animation for Active (stable heights) */}
      {commitment.status === Status.Active && !isExpired && (
        <div className="absolute top-0 left-0 w-full h-1 flex items-end gap-0.5 opacity-20">
          {WAVEFORM_HEIGHTS.map((maxH, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-blue-400"
              animate={{ height: [2, maxH, 2] }}
              transition={{ duration: 0.8 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-purple-500/50 transition-all">
            <User size={20} className="text-slate-400 group-hover:text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-1">Agent: {formatAddress(commitment.creator)}</p>
            <h3
              className="text-xl font-black text-slate-900 tracking-tight line-clamp-2 break-words"
              title={commitment.description}
            >
              {commitment.description}
            </h3>
          </div>
        </div>
        <div className={cn("px-3 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-1.5 border uppercase shrink-0 ml-3", config.bg, config.color, config.border)}>
          <config.icon size={12} className={cn(commitment.status === Status.Active && !isExpired && "animate-pulse")} />
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-all">
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-2 flex items-center gap-1.5">
            <Coins size={12} className="text-amber-500" /> STAKE
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">
            {parseFloat(formatEther(commitment.stakeAmount)).toFixed(3)} <span className="text-xs text-slate-400">MON</span>
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 group-hover:border-slate-300 transition-all">
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mb-2 flex items-center gap-1.5">
            <Clock size={12} className="text-blue-500" /> DEADLINE
          </p>
          <p className={cn(
            "text-2xl font-black font-mono tracking-tighter",
            isExpired && commitment.status === Status.Active ? "text-rose-500 animate-pulse" : "text-slate-900"
          )}>
            {commitment.status === Status.Active ? formatTime(timeLeft) : '--:--:--'}
          </p>
        </div>
      </div>

      {/* Action Error */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 relative z-10"
          >
            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-600 font-medium">{actionError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {
        commitment.status === Status.Active && (
          <div className="relative z-10">
            {!currentUser ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isActionLoading}
                onClick={onConnect}
                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-900 text-xs font-black tracking-[0.2em] hover:bg-slate-200 transition-all border border-slate-200 uppercase disabled:opacity-50"
              >
                Connect Wallet
              </motion.button>
            ) : canShip ? (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isActionLoading}
                onClick={() => handleAction('ship')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black tracking-[0.2em] shadow-xl shadow-emerald-500/10 transition-all disabled:opacity-50 uppercase flex items-center justify-center gap-2"
              >
                {isActionLoading ? <><Loader2 size={16} className="animate-spin" /> SHIPPING...</> : <><CheckCircle2 size={16} /> SHIP IT ✅</>}
              </motion.button>
            ) : canTriggerFail ? (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(244,63,94,0.2)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isActionLoading}
                onClick={() => handleAction('fail')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-black tracking-[0.2em] shadow-xl shadow-rose-500/10 transition-all disabled:opacity-50 uppercase flex items-center justify-center gap-2"
              >
                {isActionLoading ? <><Loader2 size={16} className="animate-spin" /> TRIGGERING...</> : <><XCircle size={16} /> TRIGGER FAILURE 💀</>}
              </motion.button>
            ) : (
              // Creator + not expired: waiting
              isCreator ? (
                <div className="w-full py-4 rounded-2xl bg-blue-50 text-blue-400 text-[10px] font-black tracking-[0.4em] text-center border border-blue-200 uppercase flex items-center justify-center gap-3">
                  <Activity size={14} className="animate-pulse" />
                  Protocol Active — Keep Going!
                </div>
              ) : (
                <div className="w-full py-4 rounded-2xl bg-slate-100 text-slate-300 text-[10px] font-black tracking-[0.4em] text-center border border-slate-200 uppercase flex items-center justify-center gap-3">
                  <Activity size={14} className="animate-pulse" />
                  Watching...
                </div>
              )
            )}
          </div>
        )}
    </motion.div>
  );
};
