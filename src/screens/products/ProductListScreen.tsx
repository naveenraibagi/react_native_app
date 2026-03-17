import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../services/products.service';
import ProductCard from '../../components/product/ProductCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '../../types';
import TrendingBanner from '../../components/shop/TrendingBanner';
import TrendingProductsAlert from '../../components/shop/TrendingProductsAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [showTrendingAlert, setShowTrendingAlert] = useState(false);

    React.useEffect(() => {
        checkTrendingAlert();
    }, []);

    const checkTrendingAlert = async () => {
        try {
            const lastShown = await AsyncStorage.getItem('last_trending_alert_time');
            const now = Date.now();
            if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
                setShowTrendingAlert(true);
                await AsyncStorage.setItem('last_trending_alert_time', now.toString());
            }
        } catch (error) {
            console.error('Error checking trending alert time:', error);
        }
    };
    const {
        data,
        isLoading,
        refetch,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['products', categoryId, sort, minPrice, maxPrice, inStock, onSale, search],
        queryFn: ({ pageParam = 1 }) => fetchProducts({
            categoryId,
            sort,
            minPrice,
            maxPrice,
            inStock,
            onSale,
            search,
            page: pageParam,
            perPage: 20
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any[], allPages: any[][]) => {
            return lastPage.length === 20 ? allPages.length + 1 : undefined;
        },
        staleTime: 3 * 60 * 1000,
    });

    const products = data?.pages.flat() ?? [];

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
            ) : !products.length ? (
                <EmptyState icon="cube-outline" title="No Products Found" subtitle="Try adjusting your filters or search query" />
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    keyExtractor={(i) => String(i.id)}
                    contentContainerStyle={s.list}
                    ListHeaderComponent={<TrendingBanner onPress={() => setShowTrendingAlert(true)} />}
                    columnWrapperStyle={{ gap: spacing.md }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    refreshControl={<RefreshControl refreshing={isFetching && !isLoading && !isFetchingNextPage} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                            style={{ width: cardW }}
                        />
                    )}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingNextPage ? (
                        <View style={{ paddingVertical: spacing.lg }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null}
                />
            )}

            <TrendingProductsAlert 
                visible={showTrendingAlert} 
                onClose={() => setShowTrendingAlert(false)} 
            />
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
        list: { padding: spacing.base, paddingBottom: 120 },
    });
