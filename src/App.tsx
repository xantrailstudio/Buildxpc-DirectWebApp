import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Directory from './pages/Directory';
import Compare from './pages/Compare';
import Favorites from './pages/Favorites';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Navbar from './components/Navbar';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/20 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        
        <footer className="border-t border-black/5 py-12 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-600 rounded-md">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold tracking-tighter text-black">BuildXpc</span>
              </div>
              
              <div className="flex gap-8">
                <Link to="/about" className="text-xs font-bold text-black/40 hover:text-cyan-600 uppercase tracking-widest">About</Link>
                <Link to="/directory" className="text-xs font-bold text-black/40 hover:text-cyan-600 uppercase tracking-widest">Directory</Link>
                <Link to="/compare" className="text-xs font-bold text-black/40 hover:text-cyan-600 uppercase tracking-widest">Compare</Link>
                <Link to="/terms" className="text-xs font-bold text-black/40 hover:text-cyan-600 uppercase tracking-widest">Terms</Link>
                <Link to="/privacy" className="text-xs font-bold text-black/40 hover:text-cyan-600 uppercase tracking-widest">Privacy</Link>
              </div>
              
              <div className="text-[10px] font-bold text-black/20 uppercase tracking-widest">
                © 2026 BuildXpc Platform. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        <Toaster theme="light" position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}
