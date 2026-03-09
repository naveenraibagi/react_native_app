export const COLORS = {
    light: {
        primary: '#1A1A2E',        // black/dark blue from logo
        primaryDark: '#000000',
        secondary: '#4A4A6A',      // neutral gray
        background: '#FFFFFF',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        border: '#EBEBEB',
        text: '#1A1A2E',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        badge: '#1A1A2E',
        primaryContrast: '#FFFFFF',
        skeleton: '#E5E7EB',
        overlay: 'rgba(0,0,0,0.4)',
        tabBar: '#FFFFFF',
        tabBarActive: '#1A1A2E',
        tabBarInactive: '#9CA3AF',
        star: '#F59E0B',
        sale: '#EF4444',
        heart: '#EF4444',
        inputBg: '#F3F4F6',
        shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        primary: '#F0EFF8',
        primaryDark: '#FFFFFF',
        secondary: '#A0A8B8',
        background: '#0F0E1A',
        // ... (rest of dark theme omitted for brevity if using replace_file_content correctly, but I need to be careful with the target content)
        surface: '#1A1927',
        card: '#1E1D2E',
        border: '#2D2B45',
        text: '#F0EFF8',
        textSecondary: '#A0A8B8',
        textMuted: '#6B7280',
        error: '#F87171',
        success: '#34D399',
        warning: '#FBBF24',
        badge: '#FF6584',
        primaryContrast: '#FFFFFF',
        skeleton: '#2D2B45',
        overlay: 'rgba(0,0,0,0.6)',
        tabBar: '#1A1927',
        tabBarActive: '#7C74FF',
        tabBarInactive: '#6B7280',
        star: '#FBBF24',
        sale: '#F87171',
        heart: '#FF6584',
        inputBg: '#2D2B45',
        shadow: 'rgba(0,0,0,0.4)',
    },
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 20,
        xl: 24,
        xxl: 30,
        xxxl: 36,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};
