import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, startAfter, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import ProductSkeleton from '../components/ProductSkeleton';

const PAGE_SIZE = 20;

export default function Browse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const categories = ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Motherboard'];

  const fetchProducts = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let q;
      const baseConstraints = [orderBy('name')];
      const collectionRef = collection(db, 'products');

      if (category) {
        if (isInitial) {
          q = query(collectionRef, where('category', '==', category), limit(PAGE_SIZE));
        } else {
          q = query(collectionRef, where('category', '==', category), startAfter(lastDoc), limit(PAGE_SIZE));
        }
      } else {
        if (isInitial) {
          q = query(collectionRef, ...baseConstraints, limit(PAGE_SIZE));
        } else {
          q = query(collectionRef, ...baseConstraints, startAfter(lastDoc), limit(PAGE_SIZE));
        }
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
  }, [category]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchProducts(false);
    }
  }, [inView, hasMore, loading, loadingMore]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12">
      <div className="space-y-4 px-4 sm:px-0">
        <h1 className="text-4xl font-bold tracking-tighter text-black">Browse Hardware</h1>
        <p className="text-black/50 font-medium">Explore our database of 15,000+ components.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 sm:px-0">
        <Button 
          variant={category === null ? "default" : "outline"}
          onClick={() => setCategory(null)}
          className="rounded-full px-6"
        >
          All
        </Button>
        {categories.map(cat => (
          <Button 
            key={cat}
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
            className="rounded-full px-6"
          >
            {cat}
          </Button>
        ))}
        
        {category && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCategory(null)}
            className="text-black/40 hover:text-red-500 gap-2 font-bold uppercase tracking-widest text-[10px]"
          >
            <X className="w-3 h-3" />
            Clear Filter
          </Button>
        )}
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              products.map((product) => (
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
