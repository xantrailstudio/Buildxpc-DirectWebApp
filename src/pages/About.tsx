import { motion } from 'motion/react';
import { Zap, Shield, Search, Database, Cpu, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 space-y-24">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-100">
          <Zap className="w-3 h-3" />
          Our Mission
        </div>
        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight">
          The Hardware <br />
          <span className="text-cyan-600">Encyclopedia.</span>
        </h1>
        <p className="text-black/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          BuildXpc was founded with a simple goal: to provide enthusiasts and professionals with the most accurate, accessible, and comprehensive hardware database on the planet.
        </p>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Comprehensive Data",
            desc: "Over 15,000 components indexed with detailed technical specifications.",
            icon: Database
          },
          {
            title: "Enthusiast Focused",
            desc: "Built by builders, for builders. We know what specs matter most.",
            icon: Cpu
          },
          {
            title: "Global Access",
            desc: "Free for everyone, everywhere. No accounts, no paywalls, just data.",
            icon: Globe
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white border border-black/5 rounded-3xl space-y-4 shadow-sm hover:border-cyan-500/30 transition-all"
          >
            <div className="p-3 bg-cyan-50 w-fit rounded-xl">
              <feature.icon className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-bold text-xl">{feature.title}</h3>
            <p className="text-black/50 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black text-white p-8 md:p-16 rounded-[3rem] space-y-8 text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Why BuildXpc?</h2>
        <p className="text-white/60 text-lg max-w-3xl mx-auto">
          In a world of fragmented data and marketing fluff, we provide the raw facts. Whether you're planning a workstation build or a high-end gaming rig, BuildXpc gives you the technical clarity you need to make informed decisions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
          {[
            { label: "Uptime", value: "99.9%" },
            { label: "Data Points", value: "100k+" },
            { label: "Daily Users", value: "5k+" },
            { label: "Latency", value: "<50ms" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-white/30">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
