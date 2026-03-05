import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistStore {
    ids: number[];
    addItem: (id: number) => void;
    removeItem: (id: number) => void;
    toggle: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            ids: [],
            addItem: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids : [...s.ids, id] })),
            removeItem: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
            toggle: (id) => {
                if (get().ids.includes(id)) get().removeItem(id);
                else get().addItem(id);
            },
            isInWishlist: (id) => get().ids.includes(id),
            clear: () => set({ ids: [] }),
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
