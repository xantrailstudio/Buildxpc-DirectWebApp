import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Cpu, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-cyan-600 rounded-lg group-hover:rotate-12 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-black">Build<span className="text-cyan-600">Xpc</span></span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link to="/compare" className="text-sm font-bold text-black/60 hover:text-cyan-600 transition-colors uppercase tracking-widest">Compare</Link>
            <Link to="/favorites" className="text-sm font-bold text-black/60 hover:text-cyan-600 transition-colors uppercase tracking-widest">Favorites</Link>
            <Link to="/about" className="text-sm font-bold text-black/60 hover:text-cyan-600 transition-colors uppercase tracking-widest">Platform</Link>
          </div>
          
          <div className="h-6 w-px bg-black/5 hidden md:block" />

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-black/60"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-black/5 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link 
                to="/compare" 
                className="text-lg font-bold text-black/60 hover:text-cyan-600 transition-colors uppercase tracking-widest py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Compare
              </Link>
              <Link 
                to="/about" 
                className="text-lg font-bold text-black/60 hover:text-cyan-600 transition-colors uppercase tracking-widest py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Platform
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
