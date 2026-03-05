import React, { useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
    Dimensions, Image, RefreshControl, StatusBar,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts, fetchCategories } from '../../services/products.service';
import { useAuthStore } from '../../stores/authStore';
import ProductCard from '../../components/product/ProductCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_H = 200;

// Mock banners – replace with WooCommerce banners/slider plugin API
const BANNERS = [
    { id: '1', title: 'Summer Sale', subtitle: 'Up to 50% off', color: ['#6C63FF', '#574FD6'] as [string, string] },
    { id: '2', title: 'New Arrivals', subtitle: 'Shop the latest', color: ['#FF6584', '#e04444'] as [string, string] },
    { id: '3', title: 'Free Shipping', subtitle: 'On orders over $50', color: ['#10B981', '#059669'] as [string, string] },
];

export default function HomeScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, isDark } = useTheme();
    const { user } = useAuthStore();
    const [activeBanner, setActiveBanner] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const { data: categories, isLoading: catLoading, refetch: refetchCats } = useQuery({
        queryKey: ['categories', 0],
        queryFn: () => fetchCategories(0),
        staleTime: 5 * 60 * 1000,
    });

    const { data: featured, isLoading: featLoading, refetch: refetchFeat } = useQuery({
        queryKey: ['products', 'featured'],
        queryFn: () => fetchProducts({ perPage: 8, sort: 'popularity' }),
        staleTime: 5 * 60 * 1000,
    });

    const { data: onSale, isLoading: saleLoading, refetch: refetchSale } = useQuery({
        queryKey: ['products', 'sale'],
        queryFn: () => fetchProducts({ onSale: true, perPage: 8 }),
        staleTime: 5 * 60 * 1000,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchCats(), refetchFeat(), refetchSale()]);
        setRefreshing(false);
    }, []);

    const s = st(colors, spacing, radius, fonts);

    const renderCategory = ({ item }: any) => (
        <TouchableOpacity
            style={s.catCard}
            onPress={() => navigation.navigate('ProductList', { categoryId: item.id, title: item.name })}
            activeOpacity={0.85}
        >
            {item.image ? (
                <Image source={{ uri: item.image.src }} style={s.catImg} />
            ) : (
                <LinearGradient colors={[colors.primary + '33', colors.primary + '55']} style={s.catImg}>
                    <Ionicons name="grid-outline" size={28} color={colors.primary} />
                </LinearGradient>
            )}
            <Text style={s.catName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.catCount}>{item.count} items</Text>
        </TouchableOpacity>
    );

    return (
        <View style={s.flex}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.header}>
                <View style={s.headerContent}>
                    <View>
                        <Text style={s.greeting}>Hello, {user?.first_name || 'Shopper'} 👋</Text>
                        <Text style={s.tagline}>What are you looking for today?</Text>
                    </View>
                    <View style={s.headerIcons}>
                        <TouchableOpacity
                            style={s.headerIconBtn}
                            onPress={() => navigation.navigate('SearchTab')}
                        >
                            <Ionicons name="search" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.headerIconBtn} onPress={() => navigation.navigate('CartTab')}>
                            <Ionicons name="cart-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Banner Carousel */}
                <View style={s.bannerSection}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) =>
                            setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
                        }
                    >
                        {BANNERS.map((b) => (
                            <LinearGradient key={b.id} colors={b.color} style={s.banner}>
                                <Text style={s.bannerTitle}>{b.title}</Text>
                                <Text style={s.bannerSub}>{b.subtitle}</Text>
                                <TouchableOpacity style={s.shopNowBtn}>
                                    <Text style={s.shopNowText}>Shop Now →</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        ))}
                    </ScrollView>
                    <View style={s.dots}>
                        {BANNERS.map((_, i) => (
                            <View key={i} style={[s.dot, i === activeBanner && s.dotActive]} />
                        ))}
                    </View>
                </View>

                {/* Categories */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Shop by Category</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('CategoryList', { title: 'All Categories' })}>
                            <Text style={s.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {catLoading ? (
                        <SkeletonLoader rows={1} cols={3} cardHeight={110} />
                    ) : (
                        <FlatList
                            data={categories?.slice(0, 8)}
                            renderItem={renderCategory}
                            keyExtractor={(i) => String(i.id)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
                            ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
                        />
                    )}
                </View>

                {/* Featured Products */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>🔥 Popular Products</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Popular', sort: 'popularity' })}>
                            <Text style={s.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {featLoading ? (
                        <SkeletonLoader rows={1} cols={2} cardHeight={220} />
                    ) : (
                        <FlatList
                            data={featured}
                            renderItem={({ item }) => (
                                <ProductCard
                                    product={item}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                                    style={{ width: (SCREEN_W - spacing.base * 2 - spacing.md) / 2, marginHorizontal: 0 }}
                                />
                            )}
                            keyExtractor={(i) => String(i.id)}
                            numColumns={2}
                            scrollEnabled={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
                            columnWrapperStyle={{ gap: spacing.md }}
                        />
                    )}
                </View>

                {/* On Sale */}
                <View style={[s.section, { marginBottom: 80 }]}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>⚡ On Sale</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProductList', { title: 'Sale', onSale: true })}>
                            <Text style={s.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {saleLoading ? (
                        <SkeletonLoader rows={1} cols={2} cardHeight={220} />
                    ) : (
                        <FlatList
                            data={onSale}
                            renderItem={({ item }) => (
                                <ProductCard
                                    product={item}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                                    style={{ width: (SCREEN_W - spacing.base * 2 - spacing.md) / 2, marginHorizontal: 0 }}
                                />
                            )}
                            keyExtractor={(i) => String(i.id)}
                            numColumns={2}
                            scrollEnabled={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.md }}
                            columnWrapperStyle={{ gap: spacing.md }}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: { paddingTop: 55, paddingBottom: 18, paddingHorizontal: spacing.base },
        headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        greeting: { color: '#fff', fontSize: fonts.sizes.lg, fontWeight: '700' },
        tagline: { color: 'rgba(255,255,255,0.8)', fontSize: fonts.sizes.sm, marginTop: 2 },
        headerIcons: { flexDirection: 'row', gap: 8 },
        headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
        scroll: { flex: 1 },
        bannerSection: { marginBottom: spacing.lg },
        banner: { width: SCREEN_W, height: BANNER_H, justifyContent: 'flex-end', padding: spacing.base + 4 },
        bannerTitle: { color: '#fff', fontSize: fonts.sizes.xxl, fontWeight: '800' },
        bannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: fonts.sizes.base, marginTop: 2 },
        shopNowBtn: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 7, alignSelf: 'flex-start' },
        shopNowText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.sm },
        dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
        dotActive: { backgroundColor: colors.primary, width: 18 },
        section: { marginBottom: spacing.xl },
        sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, marginBottom: spacing.md },
        sectionTitle: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text },
        seeAll: { fontSize: fonts.sizes.sm, color: colors.primary, fontWeight: '600' },
        catCard: { alignItems: 'center', width: 90 },
        catImg: { width: 72, height: 72, borderRadius: radius.lg, marginBottom: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
        catName: { fontSize: fonts.sizes.xs + 1, fontWeight: '600', color: colors.text, textAlign: 'center' },
        catCount: { fontSize: fonts.sizes.xs, color: colors.textMuted, textAlign: 'center' },
    });
