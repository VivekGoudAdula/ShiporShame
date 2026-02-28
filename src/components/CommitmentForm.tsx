import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Clock, Coins, Loader2, X, Target, Zap, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CatMascot } from './CatMascot';
import { ethers } from 'ethers';
import meowSound from '../public/sounds/meow.mp3';

interface CommitmentFormProps {
  onCommit: (desc: string, duration: number, stake: string) => Promise<void>;
  loading: boolean;
  address: string | null;
  onConnect: () => Promise<void>;
  isCorrectNetwork: boolean;
  balance?: bigint | null;
}

function ValidationMessage({ message, type }: { message: string; type: 'error' | 'success' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-2 text-xs font-bold mt-2 px-3 py-2 rounded-xl ${type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}
    >
      {type === 'error' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
      {message}
    </motion.div>
  );
}

export const CommitmentForm = ({ onCommit, loading, address, onConnect, isCorrectNetwork, balance }: CommitmentFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [stake, setStake] = useState('0.1');
  const [txError, setTxError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const validateDescription = useCallback((val: string): boolean => {
    if (!val.trim()) {
      setDescError('Description cannot be empty.');
      return false;
    }
    if (val.trim().length < 5) {
      setDescError('Description must be at least 5 characters.');
      return false;
    }
    if (val.length > 280) {
      setDescError('Description cannot exceed 280 characters.');
      return false;
    }
    setDescError(null);
    return true;
  }, []);

  const validateStake = useCallback((val: string): boolean => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setStakeError('Stake must be a positive number.');
      return false;
    }
    if (num < 0.001) {
      setStakeError('Minimum stake is 0.001 MON.');
      return false;
    }
    if (balance !== null && balance !== undefined) {
      const stakeWei = ethers.parseEther(val);
      if (stakeWei > balance) {
        setStakeError('Stake exceeds your wallet balance.');
        return false;
      }
    }
    setStakeError(null);
    return true;
  }, [balance]);

  const handleNextStep = () => {
    if (step === 1 && !validateDescription(description)) return;
    if (step === 3 && !validateStake(stake)) return;
    setStep(s => s + 1);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setDescription('');
    setStake('0.1');
    setDuration(60);
    setTxError(null);
    setDescError(null);
    setStakeError(null);
  };

  const handleSubmit = async () => {
    if (!address) {
      await onConnect();
      return;
    }
    if (!isCorrectNetwork) return;

    if (!validateDescription(description)) { setStep(1); return; }
    if (!validateStake(stake)) return;

    setTxError(null);
    try {
      await onCommit(description, duration, stake);
      handleClose();
    } catch (err: any) {
      const msg = err.message || 'Transaction failed. Please try again.';
      setTxError(msg.length > 150 ? msg.slice(0, 150) + '...' : msg);
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (descError) validateDescription(e.target.value);
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStake(e.target.value);
    if (stakeError) validateStake(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto mb-20 px-6">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              new Audio(meowSound).play();
              setIsOpen(true);
            }}
            className="w-full p-10 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-200/50 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-600 transition-all">
                <Plus size={32} className="text-slate-300 group-hover:text-purple-600" />
              </div>
              <div className="text-center">
                <span className="block text-2xl font-black text-slate-400 group-hover:text-slate-600 transition-all tracking-tight">
                  NEW COMMITMENT
                </span>
                <span className="text-[10px] font-mono text-purple-500/40 tracking-[0.4em] uppercase">
                  Initialize Protocol
                </span>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="modal"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-white/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl glass-panel p-8 sm:p-10 rounded-[40px] relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Target className="text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Commitment Ritual</h2>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-1 rounded-full transition-all duration-300 ${step >= i ? 'bg-purple-600' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="min-h-[300px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full space-y-6 text-center"
                    >
                      <CatMascot isGenerating={false} reaction="neutral" size={128} className="mx-auto mb-6" mode="mascot" />
                      <div className="space-y-2 text-left">
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-4">WHAT ARE YOU SHIPPING?</h3>
                        <textarea
                          autoFocus
                          value={description}
                          onChange={handleDescChange}
                          placeholder="Type your mission... (5–280 characters)"
                          maxLength={280}
                          className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-5 text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all resize-none h-32 ${descError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-purple-500'
                            }`}
                        />
                        <div className="flex justify-between items-start px-1">
                          <AnimatePresence>
                            {descError && <ValidationMessage message={descError} type="error" />}
                          </AnimatePresence>
                          <span className={`text-xs font-mono ml-auto mt-1 ${description.length > 260 ? 'text-rose-500' : 'text-slate-300'}`}>
                            {description.length}/280
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full space-y-10 text-center"
                    >
                      <div className="relative w-44 h-44 mx-auto">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                          <motion.circle
                            cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent"
                            className="text-purple-600"
                            strokeLinecap="round"
                            strokeDasharray={502.6}
                            animate={{ strokeDashoffset: 502.6 - Math.min((duration / 1440), 1) * 502.6 }}
                            transition={{ duration: 0.3 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-900">{duration}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {duration < 60 ? 'Minutes' : duration < 1440 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '24 Hours'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Set Your Deadline</h3>
                        <input
                          type="range"
                          min="1"
                          max="1440"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          <span>1 Min</span>
                          <span>24 Hours</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full space-y-8 text-center"
                    >
                      <div className="flex justify-center gap-4">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center"
                          >
                            <Coins className="text-amber-500" size={24} />
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div className="text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-2">Stake Amount</span>
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">{parseFloat(stake).toFixed(3)} <span className="text-xl text-slate-300">MON</span></span>
                        </div>

                        <input
                          type="range"
                          min="0.01"
                          max="10"
                          step="0.01"
                          value={stake}
                          onChange={handleStakeChange}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />

                        {/* Manual input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={stake}
                            onChange={(e) => { setStake(e.target.value); if (stakeError) validateStake(e.target.value); }}
                            className={`flex-1 bg-slate-50 border-2 rounded-2xl px-4 py-3 text-center font-black text-slate-900 focus:outline-none transition-all ${stakeError ? 'border-rose-400' : 'border-slate-200 focus:border-amber-400'
                              }`}
                            placeholder="0.100"
                          />
                          <span className="text-sm font-black text-slate-400">MON</span>
                        </div>

                        <AnimatePresence>
                          {stakeError && <ValidationMessage message={stakeError} type="error" />}
                        </AnimatePresence>

                        {balance !== null && balance !== undefined && (
                          <p className="text-xs text-slate-400 font-mono">
                            Balance: {parseFloat(ethers.formatEther(balance)).toFixed(4)} MON
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* TX Error */}
              <AnimatePresence>
                {txError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3"
                  >
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-600 font-medium leading-relaxed">{txError}</p>
                    <button onClick={() => setTxError(null)} className="ml-auto shrink-0 text-rose-400 hover:text-rose-600">
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Network warning */}
              <AnimatePresence>
                {!isCorrectNetwork && address && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3"
                  >
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-600 font-bold">Switch to Monad Testnet to submit.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex gap-4">
                {step > 1 && (
                  <button
                    disabled={loading}
                    onClick={() => setStep(s => s - 1)}
                    className="p-5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-30"
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                {step < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-900 font-black tracking-[0.2em] flex items-center justify-center gap-3 uppercase hover:bg-slate-200 transition-all"
                  >
                    Next Step
                    <ChevronRight size={20} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={loading ? {} : {
                      y: -3,
                      filter: 'brightness(1.1)',
                      boxShadow: "0 15px 40px rgba(139, 92, 246, 0.3)"
                    }}
                    whileTap={loading ? {} : { scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    disabled={loading || (!isCorrectNetwork && !!address)}
                    onClick={handleSubmit}
                    className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black tracking-[0.2em] shadow-xl shadow-purple-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase relative overflow-hidden group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>LOCKING IN...</span>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Zap size={18} className="relative z-10" />
                          <motion.div
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.15, repeat: Infinity }}
                          >
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 12C5 12 9 8 9 5C9 2 7 0 5 0C3 0 1 2 1 5C1 8 5 12 5 12Z" fill="#D8B4FE" />
                              <path d="M5 9C5 9 7.5 6.5 7.5 4.5C7.5 2.5 6.5 1 5 1C3.5 1 2.5 2.5 2.5 4.5C2.5 6.5 5 9 5 9Z" fill="white" />
                            </svg>
                          </motion.div>
                        </div>
                        {address ? '🔥 LOCK IT IN' : 'Connect Wallet'}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
