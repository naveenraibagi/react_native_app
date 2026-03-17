import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { activeConfig } from '../../config';

const { width } = Dimensions.get('window');

const LOGO_MAP: Record<string, any> = {
    'sbdh-crafts': require('../../../assets/apps/sbdh-crafts/icon.png'),
    'sbdh-pixels': require('../../../assets/apps/sbdh-pixels/user-logo.png'),
};

interface StaticSplashScreenProps {
    onComplete: () => void;
    duration?: number;
}

export default function StaticSplashScreen({ onComplete, duration = 2000 }: StaticSplashScreenProps) {
    const { colors } = useTheme();
    const logoSource = LOGO_MAP[activeConfig.id] || require('../../../assets/icon.png');

    useEffect(() => {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, s.container, { backgroundColor: '#FFFFFF' }]}>
            <Image 
                source={logoSource} 
                style={s.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 9999,
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
    }
});
