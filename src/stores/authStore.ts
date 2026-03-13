import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WCUser } from '../types';
import * as SecureStore from 'expo-secure-store';
import { ACTIVE_APP_ID } from '../config';

interface AuthStore {
    user: WCUser | null;
    token: string | null;
    isLoggedIn: boolean;
    setAuth: (user: WCUser, token: string) => void;
    updateUser: (user: Partial<WCUser>) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoggedIn: false,
            setAuth: (user, token) => {
                SecureStore.setItemAsync('jwt_token', token).catch(() => { });
                set({ user, token, isLoggedIn: true });
            },
            updateUser: (partial) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...partial } : null,
                })),
            logout: () => {
                SecureStore.deleteItemAsync('jwt_token').catch(() => { });
                set({ user: null, token: null, isLoggedIn: false });
            },
        }),
        {
            name: `auth-storage-${ACTIVE_APP_ID}`,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
);
