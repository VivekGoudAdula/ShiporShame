import { motion } from 'motion/react';
import { Trophy, Medal, Flame, Zap, Crown, Target } from 'lucide-react';
import { Commitment, Status } from '../hooks/useContract';
import { formatAddress } from '../utils/contract';
import { cn } from '../utils/cn';

interface LeaderboardProps {
  commitments: Commitment[];
  currentUser: string | null;
}

export const Leaderboard = ({ commitments, currentUser }: LeaderboardProps) => {
  // Aggregate stats safely
  const statsMap = commitments.reduce((acc: Record<string, { address: string; shipped: number; failed: number; lastFailed: boolean }>, curr) => {
    const addr = curr.creator.toLowerCase();
    if (!acc[addr]) {
      acc[addr] = { address: curr.creator, shipped: 0, failed: 0, lastFailed: false };
    }
    if (curr.status === Status.Shipped) {
      acc[addr].shipped++;
      acc[addr].lastFailed = false;
    } else if (curr.status === Status.Failed) {
      acc[addr].failed++;
      acc[addr].lastFailed = true;
    }
    return acc;
  }, {});

  // Calculate streak separately as longest current run of ships without a fail
  // (based on sequential ordering of commitments as returned: reversed = newest first)
  const streakMap: Record<string, number> = {};
  // Process commitments oldest-first for streak (reverse of the current reversed list)
  const chronological = [...commitments].reverse();
  for (const c of chronological) {
    const addr = c.creator.toLowerCase();
    if (!(addr in streakMap)) streakMap[addr] = 0;
    if (c.status === Status.Shipped) {
      streakMap[addr]++;
    } else if (c.status === Status.Failed) {
      streakMap[addr] = 0;
    }
  }

  const sorted = Object.values(statsMap)
    .map(user => ({
      ...user,
      streak: streakMap[user.address.toLowerCase()] ?? 0,
      // Safe divide-by-zero: if no shipped or failed, rate = 0
      winRate: (user.shipped + user.failed) > 0
        ? Math.round((user.shipped / (user.shipped + user.failed)) * 100)
        : 0
    }))
    .filter(u => u.shipped > 0 || u.failed > 0) // Only show users with activity
    .sort((a, b) => b.shipped - a.shipped || b.winRate - a.winRate) // Secondary sort by winRate
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-10 rounded-[40px] glass-panel relative overflow-hidden border-purple-500/20 shadow-xl shadow-purple-500/5"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full" />

      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Trophy className="text-amber-500" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Hall of Fame</h2>
          <div className="flex items-center gap-2">
            <Target size={12} className="text-purple-600" />
            <p className="text-[10px] font-mono text-purple-600 tracking-[0.2em] uppercase font-black">Elite Protocol Rankings</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {sorted.length > 0 ? sorted.map((user, i) => {
          const isMe = currentUser?.toLowerCase() === user.address.toLowerCase();

          return (
            <motion.div
              key={user.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative flex items-center justify-between p-5 rounded-3xl transition-all duration-300 group overflow-hidden",
                isMe
                  ? "bg-purple-500/10 border-2 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                  : "bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200"
              )}
            >
              {i === 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
              )}

              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-11 h-11 flex items-center justify-center font-black rounded-2xl border transition-all duration-300",
                  i === 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)] scale-110" :
                    i === 1 ? "bg-slate-400/10 border-slate-400/20 text-slate-400" :
                      i === 2 ? "bg-orange-600/10 border-orange-600/20 text-orange-600" :
                        "bg-slate-100 border-slate-200 text-slate-400 text-sm"
                )}>
                  {i === 0 ? <Crown size={22} className="animate-bounce" /> : i < 3 ? <Medal size={22} /> : i + 1}
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-mono mb-1.5 flex items-center gap-2",
                    isMe ? "text-purple-600 font-black" : "text-slate-600"
                  )}>
                    {formatAddress(user.address)}
                    {isMe && <span className="text-[8px] bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">YOU</span>}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
                      <Zap size={10} /> {user.shipped} SHIPS
                    </div>
                    {user.streak > 1 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 text-[10px] font-black border border-orange-500/20 animate-pulse">
                        <Flame size={10} /> {user.streak}🔥
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right min-w-[72px]">
                <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Success</p>
                <p className="text-xl font-black text-slate-900 tracking-tighter mb-1.5">
                  {user.winRate}%
                </p>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${user.winRate}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
            <Trophy size={32} className="mx-auto mb-4 text-slate-200" />
            <p className="text-slate-300 text-xs font-black tracking-widest uppercase">No ships yet — be the first!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
