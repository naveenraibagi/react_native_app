import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useWishlistStore } from '../../stores/wishlistStore';
import { fetchProductById } from '../../services/products.service';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';

const { width: W } = Dimensions.get('window');

export default function WishlistScreen({ navigation }: any) {
    const { ids } = useWishlistStore();
    const { colors, spacing } = useTheme();

    if (!ids.length) {
        return <EmptyState icon="heart-outline" title="Your Wishlist is Empty" subtitle="Tap the heart on products to save them here" />;
    }

    const cardW = (W - spacing.base * 2 - spacing.base) / 2;

    return (
        <FlatList
            data={ids}
            numColumns={2}
            keyExtractor={(id) => String(id)}
            contentContainerStyle={{ padding: spacing.base, gap: spacing.base, paddingBottom: 120 }}
            columnWrapperStyle={{ gap: spacing.base }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.base }} />}
            renderItem={({ item: productId }) => <WishlistItem productId={productId} navigation={navigation} cardW={cardW} />}
        />
    );
}

function WishlistItem({ productId, navigation, cardW }: any) {
    const { data: product } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProductById(productId),
    });
    if (!product) return <View style={{ width: cardW, height: 220 }} />;
    return <ProductCard product={product} onPress={() => navigation.navigate('ProductDetail', { productId })} style={{ width: cardW }} />;
}
