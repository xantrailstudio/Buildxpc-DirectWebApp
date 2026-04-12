import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import { useAppStore } from '../lib/store';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const { favorites } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const docs = await Promise.all(
          favorites.map(slug => getDoc(doc(db, 'products', slug)))
        );
        const data = docs
          .filter(d => d.exists())
          .map(d => d.data() as Product);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [favorites]);

  return (
    <div className="max-w-6xl mx-auto py-12 md:py-24 px-4 space-y-12">
      <header className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
          <Heart className="w-3 h-3 fill-current" />
          Your Collection
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-black">
          Favorite <span className="text-red-500">Hardware.</span>
        </h1>
        <p className="text-black/40 text-lg font-medium">
          Your curated list of components. Saved locally for your next build.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-black/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-6 bg-black/5 rounded-[3rem] border border-dashed border-black/10">
          <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-sm">
            <Heart className="w-8 h-8 text-black/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No favorites yet</h3>
            <p className="text-black/40 font-medium">Start exploring the directory to save components.</p>
          </div>
          <Link 
            to="/directory" 
            className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors uppercase tracking-widest group"
          >
            Browse Directory
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
