import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-black">
          About <span className="text-cyan-600">BuildXpc</span>
        </h1>
        <p className="text-xl text-black/60 leading-relaxed">
          BuildXpc is the world's most comprehensive hardware directory, designed for enthusiasts, 
          builders, and professionals who demand precision data.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white border border-black/5 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-black">Our Mission</h2>
          <p className="text-black/60 leading-relaxed">
            To provide a unified, high-performance platform where every PC component ever made 
            is indexed with its full technical specifications, accessible instantly to anyone.
          </p>
        </div>
        <div className="p-8 bg-white border border-black/5 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-black">The Platform</h2>
          <p className="text-black/60 leading-relaxed">
            Built on top of modern cloud infrastructure, BuildXpc handles thousands of data points 
            with zero latency, ensuring you find exactly what you need for your next build.
          </p>
        </div>
      </div>
    </div>
  );
}
