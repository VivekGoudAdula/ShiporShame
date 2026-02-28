import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CommitmentForm } from './components/CommitmentForm';
import { CommitmentCard } from './components/CommitmentCard';
import { Leaderboard } from './components/Leaderboard';
import { RewardPool } from './components/RewardPool';
import { CyberBackground } from './components/CyberBackground';
import { IntroScreen } from './components/IntroScreen';
import { ShippyMascot, ShippyState } from './components/ShippyMascot';
import { useWallet } from './hooks/useWallet';
import { useContract, Status } from './hooks/useContract';
import { CONTRACT_ADDRESS } from './utils/contract';
import { AlertCircle, Flame, Shield, Terminal, Fingerprint, Activity, Zap, X } from 'lucide-react';
import { cn } from './utils/cn';
import { ethers } from 'ethers';
import shipOrShameLogo from './public/images/logo.png';

export default function App() {
  const {
    address,
    signer,
    provider,
    isCorrectNetwork,
    isConnecting,
    error: walletError,
    connect,
    switchNetwork
  } = useWallet();

  const {
    commitments,
    rewardPool,
    loading,
    error: contractError,
    clearError,
    commit,
    markShipped,
    triggerFail
  } = useContract(signer, provider);

  const [showDemoWarning, setShowDemoWarning] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isFailureDrama, setIsFailureDrama] = useState(false);
  const [isShipDrama, setIsShipDrama] = useState(false);
  const [walletBalance, setWalletBalance] = useState<bigint | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setShowDemoWarning(true);
    }
  }, []);

  // Show wallet errors to user
  useEffect(() => {
    if (walletError) setGlobalError(walletError);
  }, [walletError]);

  // Show contract errors to user
  useEffect(() => {
    if (contractError) setGlobalError(contractError);
  }, [contractError]);

  // Fetch wallet balance for stake validation
  useEffect(() => {
    let cancelled = false;
    const fetchBalance = async () => {
      if (!provider || !address) {
        setWalletBalance(null);
        return;
      }
      try {
        const bal = await provider.getBalance(address);
        if (!cancelled) setWalletBalance(bal);
      } catch {
        if (!cancelled) setWalletBalance(null);
      }
    };
    fetchBalance();
    return () => { cancelled = true; };
  }, [provider, address]);

  // Calculate user DNA (safe)
  const userCommitments = address
    ? commitments.filter(c => c.creator.toLowerCase() === address.toLowerCase())
    : [];
  const totalShips = userCommitments.filter(c => c.status === Status.Shipped).length;
  const totalFails = userCommitments.filter(c => c.status === Status.Failed).length;

  // Streak = current consecutive ships working backwards from most recent
  const currentStreak = (() => {
    let streak = 0;
    for (let i = 0; i < userCommitments.length; i++) {
      const s = userCommitments[i].status;
      if (s === Status.Shipped) streak++;
      else if (s === Status.Failed) break;
    }
    return streak;
  })();

  const mascotState: ShippyState =
    isShipDrama ? 'happy' :
      isFailureDrama ? 'angry' :
        rewardPool > ethers.parseEther('3') ? 'concerned' :
          currentStreak > 3 ? 'streak' :
            'neutral';

  const handleFail = useCallback(async (id: number) => {
    try {
      await triggerFail(id);
      setIsFailureDrama(true);
      setTimeout(() => setIsFailureDrama(false), 2500);
    } catch (e: any) {
      setGlobalError(e.message || 'Failed to trigger failure.');
    }
  }, [triggerFail]);

  const handleShip = useCallback(async (id: number) => {
    try {
      await markShipped(id);
      setIsShipDrama(true);
      setTimeout(() => setIsShipDrama(false), 2500);
    } catch (e: any) {
      setGlobalError(e.message || 'Failed to mark as shipped.');
    }
  }, [markShipped]);

  const dismissGlobalError = () => {
    setGlobalError(null);
    clearError();
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-purple-500/30 transition-colors duration-500",
        isFailureDrama && "bg-rose-50"
      )}
    >
      {/* Failure drama overlay */}
      <AnimatePresence>
        {isFailureDrama && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.4, 0.7, 1] }}
            className="fixed inset-0 bg-rose-600/10 pointer-events-none z-[200] backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      {/* Ship success overlay */}
      <AnimatePresence>
        {isShipDrama && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, times: [0, 0.2, 1] }}
            className="fixed inset-0 bg-emerald-500/8 pointer-events-none z-[200]"
          />
        )}
      </AnimatePresence>

      {/* Global Error Toast */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[300] flex items-start gap-3 px-5 py-4 rounded-2xl bg-white border border-rose-200 shadow-2xl shadow-rose-500/10 max-w-sm w-[90vw]"
          >
            <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 font-medium leading-snug flex-1">{globalError}</p>
            <button
              onClick={dismissGlobalError}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro screen */}
      <AnimatePresence>
        {!isIntroComplete && (
          <IntroScreen onComplete={() => setIsIntroComplete(true)} />
        )}
      </AnimatePresence>

      <CyberBackground />

      <AnimatePresence>
        {isIntroComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Navbar
              address={address}
              isCorrectNetwork={isCorrectNetwork}
              isConnecting={isConnecting}
              onConnect={connect}
              onSwitchNetwork={switchNetwork}
              totalShips={totalShips}
              currentStreak={currentStreak}
            />

            <main className="relative">
              <Hero />

              <div className="bg-slate-50 relative pt-24 mt-[-40px] z-10">
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-40">
                  {/* Demo Mode Banner */}
                  {showDemoWarning && (
                    <div className="mb-20 p-7 rounded-[32px] bg-blue-50 border border-blue-100 flex items-start gap-5">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Terminal className="text-blue-600" size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 mb-1 uppercase tracking-tight">Demo Mode Active</h4>
                        <p className="text-blue-600/60 text-sm font-medium">
                          Smart contract not detected at address. Displaying protocol simulation.
                          Deploy to Monad Testnet to enable live staking.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Commitment Form — blocked if wrong network */}
                  <div className="mb-24">
                    <CommitmentForm
                      onCommit={commit}
                      loading={loading}
                      address={address}
                      onConnect={connect}
                      isCorrectNetwork={isCorrectNetwork}
                      balance={walletBalance}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-24">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-16">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                        <div>
                          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 text-slate-900">ACTIVE PROTOCOLS</h2>
                          <p className="text-slate-400 text-xs font-mono tracking-[0.3em] uppercase">Real-time commitment monitoring</p>
                        </div>
                        <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 self-start sm:self-auto shadow-sm">
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-blue-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> ACTIVE
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> SHIPPED
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-rose-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-600" /> FAILED
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <AnimatePresence mode="popLayout">
                          {commitments.length > 0 ? commitments.map((c) => (
                            <CommitmentCard
                              key={c.id}
                              commitment={c}
                              currentUser={address}
                              onShip={handleShip}
                              onFail={handleFail}
                              onConnect={connect}
                              loading={loading}
                            />
                          )) : (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-white shadow-sm"
                            >
                              <ShippyMascot state="neutral" className="mx-auto mb-8 opacity-40 grayscale" />
                              <p className="text-slate-400 text-sm font-black tracking-[0.25em] uppercase">No active missions detected</p>
                              <p className="text-slate-500 text-xs font-mono mt-3">Be the first to commit!</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-16">
                      {/* Shipping DNA — only when connected */}
                      {address && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-8 rounded-[40px] bg-white border border-emerald-100 relative overflow-hidden group shadow-xl shadow-emerald-500/5"
                        >
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
                          <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight text-slate-900 font-sans">
                            <Fingerprint size={20} className="text-emerald-500" />
                            SHIPPING DNA
                          </h3>

                          <div className="grid grid-cols-2 gap-5 mb-8">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Ships</p>
                              <p className="text-3xl font-black text-emerald-600">{totalShips}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Fails</p>
                              <p className="text-3xl font-black text-rose-600">{totalFails}</p>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <Flame size={15} className="text-orange-500" />
                                <span className="text-xs font-black text-slate-400 uppercase">Current Streak</span>
                              </div>
                              <span className="text-xl font-black text-slate-900">{currentStreak}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity size={15} className="text-blue-400" />
                                <span className="text-xs font-black text-slate-400 uppercase">Cat Mood</span>
                              </div>
                              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                {currentStreak > 3 ? "Hyper-Focused 🔥" : totalFails > 2 ? "Disappointed 😞" : "Optimistic 😸"}
                              </span>
                            </div>
                          </div>

                          {/* Mini mascot in the DNA panel */}
                          <div className="mt-10 flex justify-center">
                            <ShippyMascot state={mascotState} className="w-24 h-24" />
                          </div>
                        </motion.div>
                      )}

                      <RewardPool amount={rewardPool} />
                      <Leaderboard commitments={commitments} currentUser={address} />

                      {/* Protocol Rules */}
                      <div className="p-8 rounded-[40px] bg-white/5 border border-purple-500/30 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight text-white">
                          <Shield size={20} className="text-purple-400" />
                          PROTOCOL RULES
                        </h3>
                        <ul className="space-y-6">
                          {[
                            { step: "01", text: "Commit to a mission and stake MON tokens as security." },
                            { step: "02", text: "Ship your mission before the deadline to reclaim your stake." },
                            { step: "03", text: "Failure to ship results in stake liquidation to the reward pool." }
                          ].map((item) => (
                            <li key={item.step} className="flex gap-5">
                              <span className="text-xs font-mono text-purple-400 font-black pt-1">{item.step}</span>
                              <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.text}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
              <div
                className="py-12 md:py-16 px-8 md:px-12 rounded-[32px] overflow-hidden"
                style={{
                  background: 'rgba(168, 85, 247, 0.45)', // Matching Light Vibrant Navbar purple
                  backdropFilter: 'blur(32px)',
                  WebkitBackdropFilter: 'blur(32px)',
                  border: '1px solid rgba(192, 132, 252, 0.25)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="flex items-center gap-5">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-16 h-16 md:w-20 md:h-20 shrink-0"
                    >
                      <img
                        src={shipOrShameLogo}
                        alt="ShipOrShame"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                    <div>
                      <span className="block font-black tracking-tighter text-2xl md:text-3xl text-white">
                        SHIP<span className="text-purple-300">OR</span>SHAME
                      </span>
                      <span className="text-[10px] font-mono text-purple-200/60 tracking-[0.4em] uppercase font-bold">
                        Monad Ecosystem
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 md:gap-12 text-[11px] font-black tracking-[0.25em] text-purple-100/60 uppercase">
                    <a href="#" className="hover:text-white transition-all">Twitter</a>
                    <a href="#" className="hover:text-white transition-all">Discord</a>
                    <a href="#" className="hover:text-white transition-all">Docs</a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
