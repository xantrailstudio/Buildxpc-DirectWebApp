import { Link } from 'react-router-dom';
import { Product } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Cpu, Activity, Zap, ExternalLink, HardDrive, Database, Box, Wind, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductCard({ product }: { product: Product; key?: string }) {
  const renderSpecs = () => {
    switch (product.category.toUpperCase()) {
      case 'GPU':
        return (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Chipset</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Cpu className="w-3 h-3 text-cyan-600" />
                {product.chipset || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">VRAM</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Database className="w-3 h-3 text-cyan-600" />
                {product.vram || 'N/A'}
              </div>
            </div>
          </>
        );
      case 'CPU':
        return (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Socket</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Settings className="w-3 h-3 text-cyan-600" />
                {product.socket || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Cores</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Activity className="w-3 h-3 text-cyan-600" />
                {product.cores ? `${product.cores} Cores` : 'N/A'}
              </div>
            </div>
          </>
        );
      case 'RAM':
        return (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Capacity</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Database className="w-3 h-3 text-cyan-600" />
                {product.capacity || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Speed</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Zap className="w-3 h-3 text-cyan-600" />
                {product.speed || 'N/A'}
              </div>
            </div>
          </>
        );
      case 'SSD':
      case 'HDD':
        return (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Capacity</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <HardDrive className="w-3 h-3 text-cyan-600" />
                {product.capacity || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Interface</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Zap className="w-3 h-3 text-cyan-600" />
                {product.interface || 'N/A'}
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Manufacturer</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Box className="w-3 h-3 text-cyan-600" />
                {product.manufacturer}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Category</span>
              <div className="flex items-center gap-2 text-sm font-medium text-black/80">
                <Settings className="w-3 h-3 text-cyan-600" />
                {product.category}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-white border-black/5 hover:border-cyan-500/30 transition-all shadow-sm hover:shadow-xl overflow-hidden group rounded-3xl h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100 text-[10px] uppercase tracking-widest font-bold">
              {product.category}
            </Badge>
            <span className="text-[10px] text-black/30 font-mono uppercase tracking-wider">{product.manufacturer}</span>
          </div>
          <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-cyan-600 transition-colors text-black min-h-[3.5rem]">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            {renderSpecs()}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1 bg-black/5 border-none hover:bg-black/10 text-black h-10 text-xs sm:text-sm rounded-xl">
            <Link to={`/product/${product.slug}`}>View Specs</Link>
          </Button>
          <Button asChild className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-sm h-10 text-xs sm:text-sm rounded-xl">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(product.name + ' price')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Price
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
