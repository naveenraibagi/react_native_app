import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Dimensions, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../services/products.service';
import ProductCard from '../../components/product/ProductCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '../../types';

const { width: W } = Dimensions.get('window');

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: 'Default', value: 'menu_order' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Rating', value: 'rating' },
    { label: 'Newest', value: 'date' },
    { label: 'Price: Low', value: 'price' },
    { label: 'Price: High', value: 'price-desc' },
];

export default function ProductListScreen({ route, navigation }: any) {
    const { categoryId, title, search, onSale } = route.params ?? {};
    const { colors, spacing, radius, fonts } = useTheme();
    const [sort, setSort] = useState<SortOption>('menu_order');
    const [showSort, setShowSort] = useState(false);
    const [minPrice, setMinPrice] = useState<number | undefined>();
    const [maxPrice, setMaxPrice] = useState<number | undefined>();
    const [inStock, setInStock] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['products', categoryId, sort, minPrice, maxPrice, inStock, onSale, search, page],
        queryFn: () => fetchProducts({ categoryId, sort, minPrice, maxPrice, inStock, onSale, search, page, perPage: 20 }),
        staleTime: 3 * 60 * 1000,
    });

    const s = st(colors, spacing, radius, fonts);
    const cardW = (W - spacing.base * 2 - spacing.md) / 2;

    return (
        <View style={s.flex}>
            {/* Sort bar */}
            <View style={s.toolbar}>
                <TouchableOpacity style={s.sortBtn} onPress={() => setShowSort(!showSort)}>
                    <Ionicons name="swap-vertical-outline" size={16} color={colors.primary} />
                    <Text style={s.sortLabel}>{SORT_OPTIONS.find(o => o.value === sort)?.label}</Text>
                    <Ionicons name={showSort ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.filterChip, inStock && s.filterChipActive]}
                    onPress={() => setInStock(!inStock)}
                >
                    <Text style={[s.filterChipText, inStock && { color: '#fff' }]}>In Stock</Text>
                </TouchableOpacity>
                {onSale && (
                    <View style={[s.filterChip, s.filterChipActive]}>
                        <Text style={[s.filterChipText, { color: '#fff' }]}>On Sale</Text>
                    </View>
                )}
            </View>

            {/* Sort dropdown */}
            {showSort && (
                <View style={s.sortMenu}>
                    {SORT_OPTIONS.map((o) => (
                        <TouchableOpacity
                            key={o.value}
                            style={[s.sortItem, sort === o.value && s.sortItemActive]}
                            onPress={() => { setSort(o.value); setShowSort(false); }}
                        >
                            <Text style={[s.sortItemText, sort === o.value && { color: colors.primary }]}>{o.label}</Text>
                            {sort === o.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {isLoading ? (
                <SkeletonLoader rows={4} cols={2} cardHeight={220} />
            ) : !data?.length ? (
                <EmptyState icon="cube-outline" title="No Products Found" subtitle="Try adjusting your filters or search query" />
            ) : (
                <FlatList
                    data={data}
                    numColumns={2}
                    keyExtractor={(i) => String(i.id)}
                    contentContainerStyle={s.list}
                    columnWrapperStyle={{ gap: spacing.md }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                            style={{ width: cardW }}
                        />
                    )}
                    onEndReached={() => setPage((p) => p + 1)}
                    onEndReachedThreshold={0.3}
                />
            )}
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        toolbar: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
        sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.inputBg, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6 },
        sortLabel: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600' },
        filterChip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.inputBg },
        filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        filterChipText: { fontSize: fonts.sizes.xs, color: colors.text, fontWeight: '600' },
        sortMenu: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 },
        sortItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: 12 },
        sortItemActive: { backgroundColor: colors.inputBg },
        sortItemText: { fontSize: fonts.sizes.sm, color: colors.text },
        list: { padding: spacing.base, paddingBottom: 80 },
    });
