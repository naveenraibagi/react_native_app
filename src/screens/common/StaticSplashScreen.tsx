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
        <View style={[StyleSheet.absoluteFill, s.container, { backgroundColor: '#000000' }]}>
            <View style={s.logoWrapper}>
                <View style={s.logoContainer}>
                    <Image 
                        source={logoSource} 
                        style={s.logo}
                        resizeMode="cover"
                    />
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    logoWrapper: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: (width * 0.7) / 2,
        backgroundColor: '#000',
        // Subtle depth to separate from black background
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    logoContainer: {
        width: '100%',
        height: '100%',
        borderRadius: (width * 0.7) / 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '115%', // Zoom in to hide checkerboard corners
        height: '115%',
    }
});
