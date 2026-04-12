import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  slug: string;
  name: string;
  category: string;
  manufacturer: string;
  [key: string]: any;
}

interface AppStore {
  favorites: string[];
  recentlyViewed: string[];
  toggleFavorite: (slug: string) => void;
  addRecentlyViewed: (slug: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      favorites: [],
      recentlyViewed: [],
      toggleFavorite: (slug) =>
        set((state) => ({
          favorites: state.favorites.includes(slug)
            ? state.favorites.filter((s) => s !== slug)
            : [...state.favorites, slug],
        })),
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [
            slug,
            ...state.recentlyViewed.filter((s) => s !== slug),
          ].slice(0, 10), // Keep last 10
        })),
    }),
    {
      name: 'buildxpc-storage',
    }
  )
);
