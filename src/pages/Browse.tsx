import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, limit, startAfter, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Search } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Fuse from 'fuse.js';

import ProductSkeleton from '../components/ProductSkeleton';

const PAGE_SIZE = 20;

export default function Browse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'manufacturer', 'category', 'chipset'],
      threshold: 0.4,
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return fuse.search(searchQuery).map(r => r.item);
  }, [searchQuery, products, fuse]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const categories = ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Motherboard', 'Storage', 'Case', 'Power Supply'];
  const manufacturers = ['NVIDIA', 'AMD', 'Intel', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'EVGA'];

  const fetchProducts = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
      setHasMore(true);
      setProducts([]); // Clear products to show skeletons and avoid stale data
    } else {
      setLoadingMore(true);
    }

    try {
      let q;
      const collectionRef = collection(db, 'products');
      let queryConstraints: any[] = [];

      if (category) {
        // Map UI categories to potential database category names
        let searchCategories = [
          category, 
          category.toLowerCase(), 
          category.toUpperCase(),
          category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
        ];

        if (category === 'SSD') {
          searchCategories = [...searchCategories, 'Solid State Drive', 'solid state drive', 'Internal Hard Drive', 'Storage'];
        }
        if (category === 'HDD') {
          searchCategories = [...searchCategories, 'Hard Drive', 'hard drive', 'Internal Hard Drive', 'Storage', 'HDD'];
        }
        if (category === 'Storage') {
          searchCategories = [...searchCategories, 'SSD', 'HDD', 'Internal Hard Drive', 'Solid State Drive'];
        }

        // Remove duplicates
        const uniqueCasings = Array.from(new Set(searchCategories));
        queryConstraints.push(where('category', 'in', uniqueCasings));
      }
      
      if (manufacturer) {
        const sentenceCase = manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1).toLowerCase();
        queryConstraints.push(where('manufacturer', 'in', [manufacturer, manufacturer.toLowerCase(), manufacturer.toUpperCase(), sentenceCase]));
      }
      
      // Note: Multiple filters + orderBy requires composite indexes in Firestore.
      // To keep it simple and avoid index errors for the user, we only order by name
      // when no filters are applied. Firestore will use Document ID order otherwise.
      if (queryConstraints.length === 0) {
        queryConstraints.push(orderBy('name'));
      }

      if (isInitial) {
        q = query(collectionRef, ...queryConstraints, limit(PAGE_SIZE));
      } else {
        q = query(collectionRef, ...queryConstraints, startAfter(lastDoc), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as Product);
      
      if (isInitial) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, [category, manufacturer]);

  const clearFilters = () => {
    setCategory(null);
    setManufacturer(null);
    setSearchQuery('');
  };

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchProducts(false);
    }
  }, [inView, hasMore, loading, loadingMore]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12">
      <div className="space-y-4 px-4 sm:px-0">
        <h1 className="text-4xl font-bold tracking-tighter text-black">Browse Hardware</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-black/50 font-medium">Explore our database of 15,000+ components.</p>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-cyan-600 transition-colors" />
            <Input 
              placeholder="Search in these results..."
              className="pl-11 h-11 bg-white border-black/5 rounded-2xl shadow-sm focus:ring-cyan-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-6 bg-white border border-black/5 p-6 rounded-[2rem] shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Categories</h3>
            {(category || manufacturer || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-black/40 hover:text-red-500 gap-2 font-bold uppercase tracking-widest text-[10px] h-auto p-0"
              >
                <X className="w-3 h-3" />
                Clear All
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={category === null ? "default" : "outline"}
              onClick={() => setCategory(null)}
              className="rounded-full px-6 h-9 text-xs"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
                className="rounded-full px-6 h-9 text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Manufacturer</h3>
          <div className="flex flex-wrap gap-2">
            {manufacturers.map(m => (
              <Button 
                key={m}
                variant={manufacturer === m ? "default" : "outline"}
                onClick={() => setManufacturer(manufacturer === m ? null : m)}
                className="rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-wider"
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          <AnimatePresence mode="wait">
            {loading && products.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Loader */}
        <div ref={ref} className="flex justify-center py-12">
          {loadingMore && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Loading more components...</p>
            </div>
          )}
          {!hasMore && !loading && products.length > 0 && (
            <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">You've reached the end of the catalog</p>
          )}
        </div>
      </div>
    </div>
  );
}
