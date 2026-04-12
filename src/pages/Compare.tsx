import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import { Input } from '../components/ui/input';
import { Search, X, ArrowLeftRight, Zap, Cpu, Activity, Clock, Thermometer, Layers, Info, Settings, Database, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { Button } from '../components/ui/button';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [p1Query, setP1Query] = useState('');
  const [p2Query, setP2Query] = useState('');
  
  const p1Slug = searchParams.get('p1');
  const p2Slug = searchParams.get('p2');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as Product);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'chipset'],
      threshold: 0.3,
    });
  }, [products]);

  const p1 = useMemo(() => products.find(p => p.slug === p1Slug), [products, p1Slug]);
  const p2 = useMemo(() => products.find(p => p.slug === p2Slug), [products, p2Slug]);

  const p1Results = useMemo(() => {
    if (!p1Query.trim()) return [];
    return fuse.search(p1Query).map(r => r.item).slice(0, 5);
  }, [p1Query, fuse]);

  const p2Results = useMemo(() => {
    if (!p2Query.trim()) return [];
    return fuse.search(p2Query).map(r => r.item).slice(0, 5);
  }, [p2Query, fuse]);

  const selectProduct = (pos: 1 | 2, slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`p${pos}`, slug);
    setSearchParams(newParams);
    if (pos === 1) setP1Query('');
    else setP2Query('');
  };

  const removeProduct = (pos: 1 | 2) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(`p${pos}`);
    setSearchParams(newParams);
  };

  const specLabels: Record<string, string> = {
    manufacturer: 'Manufacturer',
    category: 'Category',
    chipset: 'Chipset',
    socket: 'Socket',
    cores: 'Cores',
    threads: 'Threads',
    capacity: 'Capacity',
    speed: 'Speed',
    vram: 'VRAM',
    tdp: 'TDP',
    base_clock: 'Base Clock',
    boost_clock: 'Boost Clock',
    interface: 'Interface',
    form_factor: 'Form Factor',
    wattage: 'Wattage',
    efficiency: 'Efficiency',
    color: 'Color',
    side_panel: 'Side Panel'
  };

  const specIcons: Record<string, any> = {
    manufacturer: Info,
    category: Layers,
    chipset: Cpu,
    socket: Settings,
    cores: Activity,
    threads: Activity,
    capacity: Database,
    speed: Zap,
    vram: Database,
    tdp: Thermometer,
    base_clock: Clock,
    boost_clock: Zap,
    interface: Zap,
    form_factor: Box,
    wattage: Zap,
    efficiency: Activity,
    color: Info,
    side_panel: Box
  };

  const comparisonRows = useMemo(() => {
    if (!p1 || !p2) return [];
    const allKeys = new Set([...Object.keys(p1), ...Object.keys(p2)]);
    return Array.from(allKeys)
      .filter(key => specLabels[key] && key !== 'name' && key !== 'slug')
      .map(key => ({
        label: specLabels[key],
        key: key as keyof Product,
        icon: specIcons[key] || Info
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [p1, p2]);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-black">
          Compare <span className="text-cyan-600">Hardware</span>
        </h1>
        <p className="text-black/50 text-lg max-w-2xl mx-auto font-medium">
          Side-by-side technical comparison of high-performance components.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-white border border-black/5 rounded-full shadow-xl">
          <ArrowLeftRight className="w-5 h-5 text-cyan-600" />
        </div>

        {/* Product 1 Selection */}
        <div className="space-y-6">
          <div className="relative">
            {p1 ? (
              <div className="p-6 bg-white border border-black/5 rounded-[2rem] shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 rounded-2xl">
                    <Cpu className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">{p1.name}</h3>
                    <span className="text-xs text-black/40 uppercase tracking-widest font-bold">{p1.manufacturer}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeProduct(1)} className="rounded-full hover:bg-red-50 hover:text-red-500">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-cyan-600 transition-colors" />
                  <Input
                    placeholder="Search first component..."
                    className="h-16 pl-12 bg-white border-black/5 rounded-2xl text-lg shadow-sm focus:ring-cyan-500/20"
                    value={p1Query}
                    onChange={(e) => setP1Query(e.target.value)}
                  />
                </div>
                <AnimatePresence>
                  {p1Results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/5 rounded-2xl shadow-2xl z-20 overflow-hidden"
                    >
                      {p1Results.map(res => (
                        <button
                          key={res.slug}
                          onClick={() => selectProduct(1, res.slug)}
                          className="w-full p-4 text-left hover:bg-black/5 flex items-center justify-between group transition-colors"
                        >
                          <span className="font-bold text-black">{res.name}</span>
                          <span className="text-[10px] text-black/30 uppercase tracking-widest font-bold">{res.manufacturer}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Product 2 Selection */}
        <div className="space-y-6">
          <div className="relative">
            {p2 ? (
              <div className="p-6 bg-white border border-black/5 rounded-[2rem] shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 rounded-2xl">
                    <Cpu className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">{p2.name}</h3>
                    <span className="text-xs text-black/40 uppercase tracking-widest font-bold">{p2.manufacturer}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeProduct(2)} className="rounded-full hover:bg-red-50 hover:text-red-500">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-cyan-600 transition-colors" />
                  <Input
                    placeholder="Search second component..."
                    className="h-16 pl-12 bg-white border-black/5 rounded-2xl text-lg shadow-sm focus:ring-cyan-500/20"
                    value={p2Query}
                    onChange={(e) => setP2Query(e.target.value)}
                  />
                </div>
                <AnimatePresence>
                  {p2Results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/5 rounded-2xl shadow-2xl z-20 overflow-hidden"
                    >
                      {p2Results.map(res => (
                        <button
                          key={res.slug}
                          onClick={() => selectProduct(2, res.slug)}
                          className="w-full p-4 text-left hover:bg-black/5 flex items-center justify-between group transition-colors"
                        >
                          <span className="font-bold text-black">{res.name}</span>
                          <span className="text-[10px] text-black/30 uppercase tracking-widest font-bold">{res.manufacturer}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
        <AnimatePresence mode="wait">
          {p1 && p2 ? (
            <motion.div
              key="comparison-table"
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 border-b border-black/5 bg-black/[0.02]">
              <div className="hidden md:flex p-8 font-bold text-black/30 uppercase tracking-widest text-xs items-center">Specification</div>
              <div className="p-4 md:p-8 font-bold text-black text-center border-r md:border-x border-black/5 text-sm md:text-base">{p1.name}</div>
              <div className="p-4 md:p-8 font-bold text-black text-center text-sm md:text-base">{p2.name}</div>
            </div>
            
            {comparisonRows.map((row, i) => (
              <div key={row.key} className={`grid grid-cols-2 md:grid-cols-3 border-b border-black/5 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-black/[0.01]'}`}>
                <div className="col-span-2 md:col-span-1 p-3 md:p-8 flex items-center gap-3 bg-black/[0.02] md:bg-transparent border-b md:border-b-0 border-black/5">
                  <row.icon className="w-4 h-4 text-cyan-600" />
                  <span className="text-[10px] md:text-sm font-bold text-black/60 uppercase tracking-widest">{row.label}</span>
                </div>
                <div className="p-4 md:p-8 text-center font-bold text-black border-r md:border-x border-black/5 text-sm md:text-base">
                  {p1[row.key] || '—'}
                </div>
                <div className="p-4 md:p-8 text-center font-bold text-black text-sm md:text-base">
                  {p2[row.key] || '—'}
                </div>
              </div>
            ))}
          </motion.div>
          ) : (
            <motion.div
              key="comparison-placeholder"
              initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center space-y-6 bg-white border border-black/5 rounded-[3rem]"
          >
            <div className="p-6 bg-black/5 w-fit mx-auto rounded-full">
              <ArrowLeftRight className="w-12 h-12 text-black/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-black">Select two components to compare</h3>
              <p className="text-black/40 max-w-xs mx-auto">Use the search bars above to find hardware and see side-by-side technical specs.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
