import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ShieldAlert, Flame, User, Activity, Loader2, WifiOff } from 'lucide-react';
import { formatAddress } from '../utils/contract';
import { cn } from '../utils/cn';
import shipOrShameLogo from '../public/images/logo.png';

interface NavbarProps {
  address: string | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  totalShips?: number;
  currentStreak?: number;
}

export const Navbar = ({
  address,
  isCorrectNetwork,
  isConnecting,
  onConnect,
  onSwitchNetwork,
  totalShips = 0,
  currentStreak = 0,
}: NavbarProps) => {
  return (
    <nav
      className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto rounded-[32px]"
      style={{
        background: 'rgba(132, 0, 255, 0.82)', // Light vibrant purple glass base
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(192, 132, 252, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Subtle inner top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 flex items-center justify-between gap-4">

        {/* Logo + Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="w-28 h-28 md:w-32 md:h-32 shrink-0 overflow-visible"
          >
            <img
              src={shipOrShameLogo}
              alt="ShipOrShame"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <div className="flex flex-col gap-1">
            <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">
              SHIP<span className="text-purple-300">OR</span>SHAME
            </span>

          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Stats pill — only when connected */}
          {address && (
            <div
              className="hidden md:flex items-center gap-5 px-5 py-2.5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Streak</span>
                <span className="text-sm font-black text-orange-300 flex items-center gap-1">
                  <Flame size={13} /> {currentStreak}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Shipped</span>
                <span className="text-sm font-black text-emerald-300 flex items-center gap-1">
                  <Activity size={13} /> {totalShips}
                </span>
              </div>
            </div>
          )}

          {/* Wrong network button */}
          <AnimatePresence>
            {!isCorrectNetwork && address && (
              <motion.button
                key="switch-network"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onSwitchNetwork}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-300 transition-all"
                style={{
                  background: 'rgba(251,191,36,0.12)',
                  border: '1px solid rgba(251,191,36,0.25)',
                }}
                title="Switch to Monad Testnet"
              >
                <ShieldAlert size={13} />
                <span className="hidden sm:inline">WRONG NETWORK</span>
                <span className="sm:hidden">⚠</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Wallet */}
          {address ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-3 pl-4 pr-2.5 py-2 rounded-2xl transition-all cursor-pointer group",
              )}
              style={{
                background: isCorrectNetwork ? 'rgba(255,255,255,0.07)' : 'rgba(251,191,36,0.1)',
                border: isCorrectNetwork
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(251,191,36,0.25)',
              }}
            >
              <div className="flex flex-col items-end gap-0.5">
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  isCorrectNetwork ? "text-emerald-400" : "text-amber-300"
                )}>
                  {isCorrectNetwork ? "✓ Monad" : "⚠ Wrong Net"}
                </span>
                <span className="text-xs font-mono text-white/75">{formatAddress(address)}</span>
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
              >
                <User size={14} className="text-purple-300" />
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: isConnecting ? 1 : 1.03 }}
              whileTap={{ scale: isConnecting ? 1 : 0.97 }}
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-2xl text-sm font-black tracking-wider text-white transition-all disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(109,40,217,0.9) 100%)',
                border: '1px solid rgba(168,85,247,0.4)',
                boxShadow: '0 0 20px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {isConnecting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="hidden sm:inline">CONNECTING...</span>
                </>
              ) : (
                <>
                  <Wallet size={15} />
                  <span className="hidden sm:inline">CONNECT WALLET</span>
                  <span className="sm:hidden">CONNECT</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Wrong network full banner */}
      <AnimatePresence>
        {!isCorrectNetwork && address && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-b-[32px]"
            style={{ borderTop: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.08)' }}
          >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-amber-200/80 text-xs font-semibold">
                <WifiOff size={13} />
                Switch to <strong className="text-amber-200">Monad Testnet</strong> to interact with the protocol.
              </div>
              <button
                onClick={onSwitchNetwork}
                className="text-[10px] font-black text-amber-300 underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap"
              >
                Switch Now →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </nav>
  );
};
