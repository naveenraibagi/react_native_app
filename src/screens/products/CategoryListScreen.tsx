import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fetchCategories } from '../../services/products.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';

export default function CategoryListScreen({ route, navigation }: any) {
    const { parentId } = route.params ?? {};
    const { colors, spacing, radius, fonts, shadows } = useTheme();

    const { data, isLoading } = useQuery({
        queryKey: ['categories', parentId ?? 0],
        queryFn: () => fetchCategories(parentId ?? 0),
    });

    const s = st(colors, spacing, radius, fonts);

    if (isLoading) return <SkeletonLoader rows={4} cols={2} cardHeight={120} />;
    if (!data?.length) return <EmptyState icon="grid-outline" title="No Categories" />;

    return (
        <FlatList
            data={data}
            numColumns={2}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={s.list}
            columnWrapperStyle={{ gap: spacing.md }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[s.card, shadows.sm]}
                    onPress={() => navigation.navigate('ProductList', { categoryId: item.id, title: item.name })}
                    activeOpacity={0.88}
                >
                    {item.image ? (
                        <Image source={{ uri: item.image.src }} style={s.img} />
                    ) : (
                        <LinearGradient colors={[colors.primary + '33', colors.primary + '66']} style={s.img}>
                            <Ionicons name="grid-outline" size={36} color={colors.primary} />
                        </LinearGradient>
                    )}
                    <View style={s.labelBox}>
                        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.count}>{item.count} Products</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        list: { padding: spacing.base, paddingBottom: 120 },
        card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden' },
        img: { width: '100%', height: 110, alignItems: 'center', justifyContent: 'center' },
        labelBox: { padding: spacing.sm },
        name: { fontSize: fonts.sizes.base, fontWeight: '700', color: colors.text },
        count: { fontSize: fonts.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    });
