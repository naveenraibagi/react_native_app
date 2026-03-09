import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';
import { WCProduct } from '../../types';
import { formatCurrency } from '../../utils/currency';


interface Props {
    product: WCProduct;
    onPress: () => void;
    style?: object;
}

export default function ProductCard({ product, onPress, style }: Props) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { toggle, isInWishlist } = useWishlistStore();
    const { addItem } = useCartStore();
    const wishlisted = isInWishlist(product.id);

    const image = product.images?.[0]?.src;
    const isOnSale = product.on_sale && product.sale_price;
    const discount = isOnSale
        ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
        : 0;

    const s = st(colors, spacing, radius, fonts);

    return (
        <TouchableOpacity style={[s.card, shadows.sm, style]} onPress={onPress} activeOpacity={0.92}>
            {/* Image */}
            <View style={s.imgWrap}>
                <Image
                    source={image ? { uri: image } : require('../../../assets/icon.png')}
                    style={s.img}
                    contentFit="cover"
                    transition={300}
                />
                {isOnSale && discount > 0 && (
                    <View style={s.discountBadge}>
                        <Text style={s.discountText}>-{discount}%</Text>
                    </View>
                )}
                <TouchableOpacity style={s.heartBtn} onPress={() => toggle(product.id)} activeOpacity={0.8}>
                    <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={18} color={wishlisted ? colors.heart : colors.textSecondary} />
                </TouchableOpacity>
                {product.stock_status === 'outofstock' && (
                    <View style={s.outOfStockOverlay}>
                        <Text style={s.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={s.info}>
                <Text style={s.name} numberOfLines={2}>{product.name}</Text>

                {/* Rating */}
                {parseFloat(product.average_rating) > 0 && (
                    <View style={s.ratingRow}>
                        <Ionicons name="star" size={11} color={colors.star} />
                        <Text style={s.ratingText}>{parseFloat(product.average_rating).toFixed(1)}</Text>
                        <Text style={s.ratingCount}>({product.rating_count})</Text>
                    </View>
                )}

                {/* Price */}
                <View style={s.priceRow}>
                    <Text style={s.price}>
                        {product.price ? formatCurrency(product.price) : 'View Price'}
                    </Text>
                    {isOnSale && (
                        <Text style={s.oldPrice}>{formatCurrency(product.regular_price)}</Text>
                    )}
                </View>

                {/* Add to Cart */}
                {product.stock_status === 'instock' && product.type === 'simple' && (
                    <TouchableOpacity
                        style={s.addBtn}
                        activeOpacity={0.85}
                        onPress={() => addItem(product)}
                    >
                        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.addBtnGrad}>
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={s.addBtnText}>Add</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            overflow: 'hidden',
            flex: 1,
        },
        imgWrap: { position: 'relative', aspectRatio: 1 },
        img: { width: '100%', height: '100%' },
        heartBtn: {
            position: 'absolute', top: 8, right: 8,
            backgroundColor: colors.surface,
            width: 30, height: 30, borderRadius: 15,
            alignItems: 'center', justifyContent: 'center',
        },
        discountBadge: {
            position: 'absolute', top: 8, left: 8,
            backgroundColor: colors.sale,
            borderRadius: radius.sm,
            paddingHorizontal: 6, paddingVertical: 2,
        },
        discountText: { color: '#fff', fontSize: fonts.sizes.xs, fontWeight: '700' },
        outOfStockOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        outOfStockText: { color: '#fff', fontSize: fonts.sizes.sm, fontWeight: '700' },
        info: { padding: spacing.sm },
        name: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text, marginBottom: 3 },
        ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 3 },
        ratingText: { fontSize: fonts.sizes.xs, color: colors.star, fontWeight: '600' },
        ratingCount: { fontSize: fonts.sizes.xs, color: colors.textMuted },
        priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
        price: { fontSize: fonts.sizes.base, fontWeight: '700', color: colors.primary },
        oldPrice: { fontSize: fonts.sizes.xs, color: colors.textMuted, textDecorationLine: 'line-through' },
        addBtn: { borderRadius: radius.sm, overflow: 'hidden' },
        addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 2 },
        addBtnText: { color: '#fff', fontSize: fonts.sizes.xs, fontWeight: '700' },
    });
