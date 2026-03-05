import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props {
    icon?: string;
    title: string;
    subtitle?: string;
}

export default function EmptyState({ icon = 'cube-outline', title, subtitle }: Props) {
    const { colors, fonts } = useTheme();
    return (
        <View style={styles.wrap}>
            <Ionicons name={icon as any} size={72} color={colors.border} />
            <Text style={[styles.title, { color: colors.text, fontSize: fonts.sizes.lg }]}>{title}</Text>
            {subtitle && <Text style={[styles.sub, { color: colors.textSecondary, fontSize: fonts.sizes.sm }]}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    title: { fontWeight: '700', marginTop: 16, textAlign: 'center' },
    sub: { marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
