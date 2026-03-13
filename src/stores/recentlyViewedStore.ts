import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_APP_ID } from '../config';
import { WCProduct } from '../types';

interface RecentlyViewedStore {
    items: WCProduct[];
    addItem: (product: WCProduct) => void;
    clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                // Remove if already exists to move to top
                const filtered = currentItems.filter(i => i.id !== product.id);
                // Limit to 10 items
                const newItems = [product, ...filtered].slice(0, 10);
                set({ items: newItems });
            },
            clear: () => set({ items: [] }),
        }),
        {
            name: `recently-viewed-storage-${ACTIVE_APP_ID}`,
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
