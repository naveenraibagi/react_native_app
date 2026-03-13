import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WCAddress } from '../types';
import { ACTIVE_APP_ID } from '../config';

interface AddressStore {
    lastBilling: WCAddress | null;
    lastShipping: WCAddress | null;
    saveBilling: (address: WCAddress) => void;
    saveShipping: (address: WCAddress) => void;
}

export const useAddressStore = create<AddressStore>()(
    persist(
        (set) => ({
            lastBilling: null,
            lastShipping: null,
            saveBilling: (address) => set({ lastBilling: address }),
            saveShipping: (address) => set({ lastShipping: address }),
        }),
        {
            name: `address-storage-${ACTIVE_APP_ID}`,
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
