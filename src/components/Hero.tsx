import { motion } from 'motion/react';
import { Rocket, Target, Trophy, Sparkles, Activity } from 'lucide-react';
import { ShippyMascot } from './ShippyMascot';

const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 400 + 400,
            x: Math.random() * 100 + '%'
          }}
          animate={{
            opacity: [0, 0.2, 0],
            y: -100,
            x: (Math.random() - 0.5) * 50 + '%'
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
        />
      ))}
    </div>
  );
};

const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      animation: 'grain 8s steps(10) infinite'
    }}
  />
);

export const Hero = () => {
  return (
    <div className="relative pt-32 md:pt-40 pb-24 overflow-hidden">
      <GrainOverlay />
      <Particles />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >


            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 relative">
              COMMIT. STAKE.<br />
              <div className="relative inline-block">
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 -z-10 blur-[40px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 50%, rgba(124,58,237,0.15), transparent 60%)',
                    transform: 'scale(2)'
                  }}
                />
                <span className="text-purple-600 text-glow-purple">SHIP.</span>
              </div> OR LOSE.
            </h1>

            <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 mb-12 font-medium leading-relaxed">
              The high-stakes productivity protocol. Put your MON tokens on the line.
              Ship your goals on time or feed the community reward pool.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {[
                { icon: Target, label: "COMMIT", color: "from-purple-600 to-purple-800" },
                { icon: Rocket, label: "STAKE", color: "from-blue-600 to-blue-800" },
                { icon: Trophy, label: "SHIP", color: "from-emerald-600 to-emerald-800" }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 shadow-xl cursor-default`}
                >
                  <item.icon size={20} className="text-white" />
                  <span className="font-black text-sm tracking-widest text-white">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass-panel p-10 md:p-12 rounded-[40px] border-slate-200">
              <ShippyMascot state="neutral" className="w-48 h-48 md:w-64 md:h-64" />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 glass-panel p-5 rounded-2xl border-slate-200 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Activity size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Global Success</p>
                  <p className="text-lg font-black text-slate-900">94.2%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

