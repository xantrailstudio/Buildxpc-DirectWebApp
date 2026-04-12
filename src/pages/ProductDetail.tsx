import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, 
  Cpu, 
  Activity, 
  Zap, 
  Clock, 
  Thermometer, 
  Layers, 
  ExternalLink,
  Info,
  Settings,
  Database,
  Box
} from 'lucide-react';
import { motion } from 'motion/react';

import { useAppStore } from '../lib/store';
import { Heart } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { favorites, toggleFavorite, addRecentlyViewed } = useAppStore();
  const isFavorite = slug ? favorites.includes(slug) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const docRef = doc(db, 'products', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct(data);
          document.title = `${data.name} Specs & Details | BuildXpc`;
          addRecentlyViewed(slug);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, addRecentlyViewed]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 md:py-12 space-y-8 px-4 animate-pulse">
        <div className="h-10 w-32 bg-black/5 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-6 w-24 bg-black/5 rounded-full" />
              <div className="h-16 w-full bg-black/5 rounded-2xl" />
              <div className="h-24 w-full bg-black/5 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-black/5 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="h-[400px] bg-black/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-3xl font-bold">Product Not Found</h2>
        <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
      </div>
    );
  }

  const specLabels: Record<string, string> = {
    manufacturer: 'Manufacturer',
    chipset: 'Chipset',
    category: 'Category',
    base_clock: 'Base Clock',
    boost_clock: 'Boost Clock',
    vram: 'VRAM',
    tdp: 'TDP',
    socket: 'Socket',
    cores: 'Cores',
    threads: 'Threads',
    capacity: 'Capacity',
    speed: 'Speed',
    form_factor: 'Form Factor',
    interface: 'Interface',
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

  const availableSpecs = Object.entries(product)
    .filter(([key, value]) => specLabels[key] && value && key !== 'name' && key !== 'slug')
    .map(([key, value]) => ({
      label: specLabels[key],
      value: value as string,
      icon: specIcons[key] || Info
    }));

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 space-y-8 md:space-y-12 px-4">
      <Button 
        onClick={() => navigate('/')} 
        variant="ghost" 
        className="text-black/40 hover:text-black hover:bg-black/5 -ml-2 md:-ml-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left: Basic Info */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100 px-3 py-1 text-[10px] md:text-xs uppercase tracking-widest font-bold">
                {product.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-black/20 hover:text-red-500 hover:bg-red-50'}`}
                onClick={() => slug && toggleFavorite(slug)}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <h1 className="text-3xl md:text-6xl font-bold tracking-tighter leading-tight text-black">
              {product.name}
            </h1>
            <p className="text-black/40 text-base md:text-lg leading-relaxed font-medium">
              {product.description || `Professional-grade ${product.category} from ${product.manufacturer}. Engineered for high-performance computing and extreme workloads.`}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {availableSpecs.map((spec, i) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 md:p-6 bg-white border border-black/5 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/30 transition-all shadow-sm"
              >
                <div className="p-2.5 md:p-3 bg-black/5 rounded-xl group-hover:bg-cyan-50 transition-colors">
                  <spec.icon className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] text-black/30 uppercase tracking-widest block font-bold">{spec.label}</span>
                  <span className="text-base md:text-lg font-bold text-black">{spec.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 bg-white border border-black/5 rounded-3xl space-y-6 sticky top-24 shadow-xl shadow-black/5">
            <div className="space-y-2">
              <span className="text-[10px] md:text-xs text-cyan-600 uppercase tracking-widest font-bold">Market Availability</span>
              <h3 className="text-xl md:text-2xl font-bold text-black">Check Current Pricing</h3>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full h-12 bg-[#F57224] hover:bg-[#d45d1a] text-white border-none text-base font-bold shadow-sm rounded-2xl">
                <a 
                  href={`https://www.daraz.pk/catalog/?q=${encodeURIComponent(product.chipset || product.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Buy on Daraz
                </a>
              </Button>

              <Button asChild className="w-full h-12 bg-[#FF9900] hover:bg-[#e68a00] text-white border-none text-base font-bold shadow-sm rounded-2xl">
                <a 
                  href={`https://www.amazon.com/s?k=${encodeURIComponent(product.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Buy on Amazon
                </a>
              </Button>

              <Button asChild className="w-full h-12 bg-[#E62E04] hover:bg-[#cc2904] text-white border-none text-base font-bold shadow-sm rounded-2xl">
                <a 
                  href={`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(product.name)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Buy on AliExpress
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full h-12 bg-black/5 border-none hover:bg-black/10 text-black rounded-2xl">
                <Link to={`/compare?p1=${product.slug}`}>
                  Compare Specs
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-black/5">
              <p className="text-[9px] md:text-[10px] text-black/20 text-center uppercase tracking-widest font-bold">
                Prices updated every 60 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
