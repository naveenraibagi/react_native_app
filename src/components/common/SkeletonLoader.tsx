import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
    rows?: number;
    cols?: number;
    cardHeight?: number;
}

const Bone = ({ width, height, style }: { width: number | string; height: number; style?: object }) => {
    const { colors } = useTheme();
    const anim = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[{ width, height, backgroundColor: colors.skeleton, borderRadius: 8, opacity: anim }, style]}
        />
    );
};

export default function SkeletonLoader({ rows = 2, cols = 2, cardHeight = 220 }: Props) {
    const { colors, spacing } = useTheme();
    return (
        <View style={styles.wrap}>
            {Array.from({ length: rows }).map((_, r) => (
                <View key={r} style={styles.row}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <View key={c} style={[styles.card, { flex: 1, backgroundColor: colors.card, borderRadius: 12 }]}>
                            <Bone width="100%" height={cardHeight * 0.6} style={{ borderRadius: 0 }} />
                            <View style={{ padding: 8, gap: 6 }}>
                                <Bone width="90%" height={12} />
                                <Bone width="60%" height={10} />
                                <Bone width="40%" height={14} />
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 16, gap: 12 },
    row: { flexDirection: 'row', gap: 12 },
    card: { overflow: 'hidden' },
});
