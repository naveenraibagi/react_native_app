import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, WCProduct } from '../types';

interface CartStore {
    items: CartItem[];
    couponCode: string;
    couponDiscount: number;
    addItem: (product: WCProduct, qty?: number, variationId?: number, attrs?: Record<string, string>) => void;
    removeItem: (productId: number, variationId?: number) => void;
    updateQty: (productId: number, qty: number, variationId?: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discount: number) => void;
    removeCoupon: () => void;
    itemCount: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            couponCode: '',
            couponDiscount: 0,

            addItem: (product, qty = 1, variationId, attrs) => {
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.product.id === product.id && i.variationId === variationId
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.product.id === product.id && i.variationId === variationId
                                    ? {
                                        ...i,
                                        quantity: i.quantity + qty,
                                        lineTotal: (i.quantity + qty) * parseFloat(product.price || '0'),
                                    }
                                    : i
                            ),
                        };
                    }
                    const price = parseFloat(product.price || '0');
                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                variationId,
                                selectedAttributes: attrs,
                                quantity: qty,
                                price,
                                lineTotal: price * qty,
                            },
                        ],
                    };
                });
            },

            removeItem: (productId, variationId) =>
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.product.id === productId && i.variationId === variationId)
                    ),
                })),

            updateQty: (productId, qty, variationId) => {
                if (qty <= 0) {
                    get().removeItem(productId, variationId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product.id === productId && i.variationId === variationId
                            ? { ...i, quantity: qty, lineTotal: qty * i.price }
                            : i
                    ),
                }));
            },

            clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),

            applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

            removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

            itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            subtotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
