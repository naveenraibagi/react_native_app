import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { activeConfig } from '../../config';
import { SHADOWS } from '../../config/theme';

const { width } = Dimensions.get('window');

const LOGO_MAP: Record<string, any> = {
    'sbdh-crafts': require('../../../assets/apps/sbdh-crafts/icon.png'),
    'sbdh-pixels': require('../../../assets/apps/sbdh-pixels/user-logo.png'),
};

interface AnimatedSplashScreenProps {
    onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
    const { colors } = useTheme();
    const logoSource = LOGO_MAP[activeConfig.id] || require('../../../assets/icon.png');

    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);
    const bgOpacity = useSharedValue(1);
    const logoRotation = useSharedValue(0);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${logoRotation.value}deg` }
        ],
        opacity: opacity.value,
    }));

    const animatedBgStyle = useAnimatedStyle(() => ({
        opacity: bgOpacity.value,
    }));

    useEffect(() => {
        // Entry animation - smoother ease
        opacity.value = withTiming(1, { duration: 1200 });
        scale.value = withDelay(100, withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.exp)
        }));

        // Subtle floating effect
        logoRotation.value = withSequence(
            withDelay(800, withTiming(-3, { duration: 400 })),
            withTiming(3, { duration: 800 }),
            withTiming(0, { duration: 400 })
        );

        // Exit sequence - faster, high impact
        const exitTimeout = setTimeout(() => {
            scale.value = withTiming(2.5, {
                duration: 900,
                easing: Easing.in(Easing.quad)
            });
            opacity.value = withTiming(0, { duration: 700 });
            bgOpacity.value = withTiming(0, { duration: 1100 }, () => {
                runOnJS(onAnimationComplete)();
            });
        }, 2800);

        return () => clearTimeout(exitTimeout);
    }, []);

    const gradientColors = (activeConfig.id === 'sbdh-pixels'
        ? ['#000000', '#050505', '#1a1a1a'] // Deep black to very dark grey for better blending
        : [colors.background, colors.background]) as [string, string, ...string[]];

    return (
        <Animated.View style={[StyleSheet.absoluteFill, s.container, animatedBgStyle]}>
            <LinearGradient
                colors={gradientColors}
                locations={[0, 0.5, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Ambient Glow - blends the logo edge into the black background */}
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{
                    width: width * 0.8,
                    height: width * 0.8,
                    backgroundColor: '#FF6B00',
                    borderRadius: width * 0.4,
                    opacity: 0.12,
                    transform: [{ scale: scale.value * 1.5 }],
                    // Softer, larger peripheral glow
                    shadowColor: '#FF6B00',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 150,
                    elevation: 5,
                }} />
            </View>

            <Animated.View style={[s.logoContainer, animatedLogoStyle]}>
                <Image
                    source={logoSource}
                    style={s.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backgroundColor: '#000',
    },
    logoContainer: {
        width: width * 0.7, // Matches the ambient glow for alignment
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
        // Removed extra shadows to let baked-in shadow shine
    }
});
