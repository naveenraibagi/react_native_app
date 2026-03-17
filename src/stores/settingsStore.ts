import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_APP_ID } from '../config';

interface SettingsStore {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            notificationsEnabled: true,
            setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
        }),
        {
            name: `${ACTIVE_APP_ID}-settings-storage`,
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
