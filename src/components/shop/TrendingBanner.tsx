import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface TrendingBannerProps {
    onPress: () => void;
}

export default function TrendingBanner({ onPress }: TrendingBannerProps) {
    const { colors, spacing, radius, fonts } = useTheme();

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, { borderRadius: radius.lg, padding: spacing.md }]}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="flame" size={24} color="#FFD700" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { fontSize: fonts.sizes.base }]}>Trending Items</Text>
                        <Text style={[styles.subtitle, { fontSize: fonts.sizes.xs }]}>Don't miss out on what's hot today!</Text>
                    </View>
                    <View style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full }]}>
                        <Text style={styles.btnText}>View Now</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 12,
        marginTop: -6,
        marginBottom: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    btnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
