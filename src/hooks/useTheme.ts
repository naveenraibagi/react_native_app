import { useColorScheme } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../config/theme';
import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
    const systemScheme = useColorScheme();
    const { mode } = useThemeStore();

    const isDark =
        mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

    return {
        colors: isDark ? COLORS.dark : COLORS.light,
        fonts: FONTS,
        spacing: SPACING,
        radius: RADIUS,
        shadows: SHADOWS,
        isDark,
    };
};
