import { motion } from 'motion/react';
import { Rocket, Target, Trophy, Sparkles, Activity } from 'lucide-react';
import { ShippyMascot } from './ShippyMascot';

const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 800 + 200,
            x: Math.random() * 100 + '%',
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            opacity: [0, 0.4, 0],
            y: -200,
            x: (Math.random() - 0.5) * 100 + '%',
            rotate: Math.random() * 360
          }}
          transition={{
            duration: Math.random() * 8 + 7,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className={`absolute w-1 h-1 rounded-full blur-[1px] ${i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-emerald-400'
            }`}
          style={{
            boxShadow: `0 0 10px ${i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#60a5fa' : '#34d399'}`
          }}
        />
      ))}
    </div>
  );
};

const AmbientGlows = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"
    />
    <motion.div
      animate={{
        x: [0, -100, 0],
        y: [0, -50, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[180px] rounded-full"
    />
  </div>
);

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
    <div className="relative pt-32 md:pt-40 pb-24 overflow-hidden min-h-screen flex items-center">
      <GrainOverlay />
      <AmbientGlows />
      <Particles />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center"
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

            <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
              The high-stakes productivity protocol. Put your MON tokens on the line.
              Ship your goals on time or feed the community reward pool.
            </p>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {[
                { icon: Target, label: "COMMIT", color: "from-purple-600 to-purple-800" },
                { icon: Rocket, label: "STAKE", color: "from-blue-600 to-blue-800" },
                { icon: Trophy, label: "SHIP", color: "from-emerald-600 to-emerald-800" }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -8, scale: 1.05, filter: 'brightness(1.1)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`flex items-center gap-4 px-8 py-4 rounded-[24px] bg-gradient-to-br ${item.color} border border-white/20 shadow-2xl cursor-pointer relative group overflow-hidden ${item.label === 'COMMIT' ? 'neon-purple' : item.label === 'STAKE' ? 'neon-blue' : 'neon-emerald'
                    }`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.icon size={22} className="text-white relative z-10" />
                  <span className="font-black text-sm tracking-[0.2em] text-white relative z-10">{item.label}</span>
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
            <div className="relative p-0 rounded-none border-none">
              <ShippyMascot state="neutral" className="w-64 h-64 md:w-80 md:h-80" />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-10 -left-10 p-0 pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center backdrop-blur-sm">
                  <Activity size={20} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-900 font-bold uppercase tracking-wider">Global Success</p>
                  <p className="text-xl font-black text-slate-900">94.2%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

