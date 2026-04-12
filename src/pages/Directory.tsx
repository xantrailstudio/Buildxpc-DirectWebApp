import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, query, limit, startAfter, where, orderBy, QueryConstraint, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Search, SlidersHorizontal, X, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 24;

const COMMON_CATEGORIES = ["CPU", "GPU", "Motherboard", "RAM", "SSD", "HDD", "PSU", "Case", "Cooler"];
const COMMON_MANUFACTURERS = ["NVIDIA", "AMD", "Intel", "ASUS", "MSI", "Gigabyte", "Corsair", "Samsung", "Crucial", "Western Digital", "Seagate", "EVGA", "NZXT", "Cooler Master"];

export default function Directory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchProducts = useCallback(async (isNextPage = false) => {
    if (isNextPage) setLoadingMore(true);
    else setLoading(true);

    try {
      const constraints: QueryConstraint[] = [orderBy('name'), limit(PAGE_SIZE)];
      
      if (selectedCategory) {
        constraints.push(where('category', '==', selectedCategory));
      }
      
      if (selectedManufacturer) {
        constraints.push(where('manufacturer', '==', selectedManufacturer));
      }

      if (isNextPage && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      // Note: Search is limited in Firestore. We'll implement a basic prefix search if searchQuery exists
      // For a real 15k db, we'd use Algolia, but here we'll try to be efficient.
      if (searchQuery) {
        // This is a basic prefix search trick
        constraints.push(where('name', '>=', searchQuery));
        constraints.push(where('name', '<=', searchQuery + '\uf8ff'));
      }

      const q = query(collection(db, 'products'), ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => doc.data() as Product);
      
      if (isNextPage) {
        setProducts(prev => [...prev, ...data]);
      } else {
        setProducts(data);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedManufacturer, searchQuery, lastDoc]);

  // Initial fetch and filter change
  useEffect(() => {
    setLastDoc(null);
    fetchProducts(false);
  }, [selectedCategory, selectedManufacturer, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedManufacturer(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 md:py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black">Component <span className="text-cyan-600">Directory</span></h1>
          <p className="text-black/50 font-medium">Browse through our massive database of hardware components.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="md:hidden flex-1 bg-white border-black/5 rounded-2xl h-12"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-cyan-600 transition-colors" />
            <Input 
              placeholder="Search components..." 
              className="pl-10 h-12 bg-white border-black/5 rounded-2xl focus:ring-cyan-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden md:block w-64 space-y-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Categories</h3>
              {(selectedCategory || selectedManufacturer) && (
                <button onClick={clearFilters} className="text-[10px] font-bold text-cyan-600 hover:underline uppercase tracking-widest">Clear</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_CATEGORIES.map(cat => (
                <Badge 
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl transition-all ${
                    selectedCategory === cat 
                    ? "bg-cyan-600 text-white border-transparent" 
                    : "bg-white text-black/60 border-black/5 hover:border-cyan-500/30"
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Manufacturers</h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_MANUFACTURERS.map(man => (
                <Badge 
                  key={man}
                  variant={selectedManufacturer === man ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl transition-all ${
                    selectedManufacturer === man 
                    ? "bg-cyan-600 text-white border-transparent" 
                    : "bg-white text-black/60 border-black/5 hover:border-cyan-500/30"
                  }`}
                  onClick={() => setSelectedManufacturer(selectedManufacturer === man ? null : man)}
                >
                  {man}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filters Overlay */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              key="mobile-filters-overlay"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="fixed inset-0 z-[100] bg-white p-6 md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CATEGORIES.map(cat => (
                      <Badge 
                        key={cat}
                        className={`px-4 py-2 rounded-xl text-sm ${selectedCategory === cat ? "bg-cyan-600 text-white" : "bg-black/5 text-black"}`}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Manufacturers</h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_MANUFACTURERS.map(man => (
                      <Badge 
                        key={man}
                        className={`px-4 py-2 rounded-xl text-sm ${selectedManufacturer === man ? "bg-cyan-600 text-white" : "bg-black/5 text-black"}`}
                        onClick={() => setSelectedManufacturer(selectedManufacturer === man ? null : man)}
                      >
                        {man}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-cyan-600 text-white h-14 rounded-2xl text-lg font-bold" onClick={() => setShowMobileFilters(false)}>
                  Apply Filters
                </Button>
                <Button variant="ghost" className="w-full text-black/40" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" key="loading-grid">
              {Array(6).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-64 bg-black/5 rounded-3xl animate-pulse border border-black/5" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" key="products-grid">
                {products.map(p => (
                  <ProductCard key={p.slug || Math.random().toString()} product={p} />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button 
                    onClick={() => fetchProducts(true)} 
                    disabled={loadingMore}
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-black/5 bg-white hover:bg-black/5 text-black font-bold group"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                    )}
                    Load More Components
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 bg-white border border-black/5 rounded-[3rem]" key="no-results">
              <div className="p-4 bg-black/5 w-fit mx-auto rounded-full">
                <Search className="w-8 h-8 text-black/20" />
              </div>
              <h3 className="text-xl font-bold text-black">No components found</h3>
              <p className="text-black/40 max-w-xs mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
              <Button variant="outline" onClick={clearFilters} className="rounded-xl">Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
