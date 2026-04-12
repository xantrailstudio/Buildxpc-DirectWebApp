import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Search, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';

import { useAppStore } from '../lib/store';

export default function Home() {
  const { recentlyViewed } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<{ name: string; slug: string }[]>([]);
  const [searchResults, setSearchResults] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  // Fetch full data for recently viewed slugs
  useEffect(() => {
    const fetchRecent = async () => {
      if (recentlyViewed.length === 0) return;
      try {
        const docs = await Promise.all(
          recentlyViewed.map(slug => getDoc(doc(db, 'products', slug)))
        );
        const data = docs
          .filter(d => d.exists())
          .map(d => d.data() as Product);
        setRecentProducts(data);
      } catch (err) {
        console.error('Error fetching recent products:', err);
      }
    };
    fetchRecent();
  }, [recentlyViewed]);

  // Fetch names/slugs for client-side search cache (No external API)
  useEffect(() => {
    const fetchSearchCache = async () => {
      try {
        // Increased limit to 15,000 for full search capability
        const q = query(collection(db, 'products'), limit(15000));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          name: doc.data().name,
          slug: doc.data().slug
        }));
        setAllProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchCache();
  }, []);

  const fuse = useMemo(() => {
    if (allProducts.length === 0) return null;
    return new Fuse(allProducts, {
      keys: ['name'],
      threshold: 0.3,
      distance: 100,
    });
  }, [allProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() === '' || !fuse) {
        setSearchResults([]);
        return;
      }
      const results = fuse.search(searchQuery).map(r => r.item);
      setSearchResults(results.slice(0, 10));
    }, 150); // Small debounce to keep UI snappy

    return () => clearTimeout(timer);
  }, [searchQuery, fuse]);

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-12 md:py-24">
      {/* Hero Section */}
      <section className="text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-100">
            <Zap className="w-3 h-3" />
            The Hardware Encyclopedia
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-black leading-[0.9]">
            Build Your <br />
            <span className="text-cyan-600">Next PC.</span>
          </h1>
          <p className="text-black/50 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed px-4">
            The new standard for hardware research. Instant access to technical specifications for 15,000+ components. 
            No login required. Just search and build.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto group px-4 sm:px-0">
          <div className="absolute inset-y-0 left-10 sm:left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-black/20 group-focus-within:text-cyan-600 transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search 15,000+ components..."
            className="w-full h-16 sm:h-20 pl-14 sm:pl-16 pr-8 bg-white border-black/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-lg sm:text-2xl rounded-2xl sm:rounded-[2rem] transition-all shadow-2xl shadow-black/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                key="search-results-dropdown"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-white border border-black/5 rounded-[2rem] overflow-hidden z-50 shadow-2xl shadow-black/10 p-2"
              >
                {searchResults.map((result) => (
                  <Link
                    key={result.slug}
                    to={`/product/${result.slug}`}
                    className="flex items-center justify-between p-5 hover:bg-black/5 transition-all group rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors">
                        <Zap className="w-5 h-5 text-cyan-600" />
                      </div>
                      <span className="font-bold text-lg text-black">{result.name}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-black/20 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <p className="text-sm font-bold text-black/20 uppercase tracking-widest">
            Search across our entire hardware database
          </p>
        </motion.div>
      </section>

      {/* Recently Viewed */}
      <AnimatePresence>
        {recentProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-end justify-between px-4 sm:px-0">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recently Viewed</h2>
                <p className="text-black/40 text-sm font-medium">Pick up where you left off</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
              {recentProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-black/5 pt-24">
        {[
          { label: "Components Indexed", value: "15,000+" },
          { label: "Categories", value: "GPU, CPU, MB" },
          { label: "Search Latency", value: "< 50ms" }
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="text-4xl font-bold text-black tracking-tighter">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest font-bold text-black/30">{stat.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
