import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSettingsStore } from '../stores/settingsStore';

// Detect if we are in the restricted Android Expo Go environment
const isAndroidExpoGo = 
    Platform.OS === 'android' && 
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Lazy-load Notifications library only when needed and safe.
 * This prevents the SDK 53 crash at import time on Android Expo Go.
 */
const getNotifications = () => {
    if (isAndroidExpoGo) return null;
    try {
        return require('expo-notifications');
    } catch (e) {
        console.log('Failed to load expo-notifications:', e);
        return null;
    }
};

// Initialize handler once if safe
let isHandlerSet = false;
const ensureHandler = () => {
    if (isAndroidExpoGo || isHandlerSet) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
        isHandlerSet = true;
    } catch (e) {
        console.log('Failed to set notification handler:', e);
    }
};

export const requestNotificationPermissions = async () => {
    if (isAndroidExpoGo) return false;
    const Notifications = getNotifications();
    if (!Notifications) return false;

    ensureHandler();
    
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    } catch (e) {
        console.log('Permission request failed:', e);
        return false;
    }
};

export const scheduleCartReminder = async (productName: string) => {
    if (isAndroidExpoGo || !useSettingsStore.getState().notificationsEnabled) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    ensureHandler();

    try {
        // Cancel any existing cart reminders first to avoid spam
        await Notifications.cancelScheduledNotificationAsync('cart_reminder');
        
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Still thinking about it? 🛒",
                body: `You left "${productName}" in your cart. Grab it before it's gone!`,
                data: { type: 'cart_reminder' },
            },
            trigger: {
                seconds: 24 * 60 * 60, // 24 hours
            },
            identifier: 'cart_reminder'
        });
        console.log(`[NotificationService] Scheduled cart reminder for ${productName} (ID: ${id})`);
    } catch (e) {
        console.error('[NotificationService] Failed to schedule cart reminder:', e);
    }
};

export const scheduleViewReminder = async (productName: string) => {
    if (isAndroidExpoGo || !useSettingsStore.getState().notificationsEnabled) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    ensureHandler();

    try {
        // Cancel any existing view reminders
        await Notifications.cancelScheduledNotificationAsync('view_reminder');

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Special offer for you! ✨",
                body: `We noticed you looking at "${productName}". Take another look today!`,
                data: { type: 'view_reminder' },
            },
            trigger: {
                seconds: 22 * 60 * 60, // 22 hours
            },
            identifier: 'view_reminder'
        });
        console.log(`[NotificationService] Scheduled view reminder for ${productName} (ID: ${id})`);
    } catch (e) {
        console.error('[NotificationService] Failed to schedule view reminder:', e);
    }
};

export const cancelNotification = async (identifier: string) => {
    if (isAndroidExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        console.log(`[NotificationService] Cancelled notification: ${identifier}`);
    } catch (e) {
        console.error(`[NotificationService] Failed to cancel notification ${identifier}:`, e);
    }
};

export const cancelAllNotifications = async () => {
    if (isAndroidExpoGo) return;
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('[NotificationService] Cancelled all notifications');
    } catch (e) {
        console.error('[NotificationService] Failed to cancel all notifications:', e);
    }
};

export const scheduleTestNotification = async (title: string, body: string) => {
    if (isAndroidExpoGo || !useSettingsStore.getState().notificationsEnabled) {
        console.log('[NotificationService] Test notification skipped: notifications disabled or Expo Go');
        return;
    }
    const Notifications = getNotifications();
    if (!Notifications) return;

    ensureHandler();

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: { title, body, data: { type: 'test' } },
            trigger: {
                seconds: 5, // 5 seconds for quick testing
            },
        });
        console.log(`[NotificationService] Scheduled test notification: ${title} (ID: ${id})`);
    } catch (e) {
        console.error('[NotificationService] Failed to schedule test notification:', e);
    }
};
