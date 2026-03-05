import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
    FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import {
    fetchProductById, fetchProductVariations, fetchProductReviews,
} from '../../services/products.service';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import ProductCard from '../../components/product/ProductCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const { width: W } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { addItem } = useCartStore();
    const { toggle, isInWishlist } = useWishlistStore();

    const [activeImgIdx, setActiveImgIdx] = useState(0);
    const [selectedVariation, setSelectedVariation] = useState<any>(null);
    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
    const [qty, setQty] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [tab, setTab] = useState<'desc' | 'reviews'>('desc');

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProductById(productId),
    });

    const { data: variations } = useQuery({
        queryKey: ['variations', productId],
        queryFn: () => fetchProductVariations(productId),
        enabled: product?.type === 'variable',
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => fetchProductReviews(productId),
    });

    const s = st(colors, spacing, radius, fonts);

    if (isLoading || !product) return (
        <View style={s.flex}>
            <SkeletonLoader rows={1} cols={1} cardHeight={W} />
            <SkeletonLoader rows={1} cols={1} cardHeight={200} />
        </View>
    );

    const images = product.images.length ? product.images : [{ id: 0, src: '', name: '', alt: '' }];
    const isWishlisted = isInWishlist(product.id);
    const inStock = (selectedVariation?.stock_status ?? product.stock_status) === 'instock';
    const currentPrice = selectedVariation?.price ?? product.price;

    const handleAttrSelect = (attrName: string, option: string) => {
        const newAttrs = { ...selectedAttrs, [attrName]: option };
        setSelectedAttrs(newAttrs);
        if (variations) {
            const match = variations.find((v: any) =>
                v.attributes.every((a: any) => newAttrs[a.name] === a.option)
            );
            setSelectedVariation(match ?? null);
        }
    };

    const handleAddToCart = async () => {
        if (product.type === 'variable' && !selectedVariation) {
            Alert.alert('Please select all options');
            return;
        }
        setAddingToCart(true);
        addItem(product, qty, selectedVariation?.id, selectedAttrs);
        setTimeout(() => {
            setAddingToCart(false);
            Alert.alert('Added to Cart! 🛒', product.name, [
                { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
                { text: 'Continue Shopping' },
            ]);
        }, 400);
    };

    return (
        <View style={s.flex}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image gallery */}
                <View>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => setActiveImgIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
                    >
                        {images.map((img, idx) => (
                            <Image key={idx} source={{ uri: img.src }} style={{ width: W, height: W * 0.85 }} contentFit="cover" />
                        ))}
                    </ScrollView>
                    {/* Dots */}
                    {images.length > 1 && (
                        <View style={s.dots}>
                            {images.map((_, i) => (
                                <View key={i} style={[s.dot, i === activeImgIdx && s.dotActive]} />
                            ))}
                        </View>
                    )}
                    {/* Wishlist button */}
                    <TouchableOpacity style={[s.heartBtn, shadows.sm]} onPress={() => toggle(product.id)}>
                        <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={22} color={isWishlisted ? colors.heart : colors.text} />
                    </TouchableOpacity>
                    {/* Back button */}
                    <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={s.content}>
                    {/* Title + Price */}
                    <Text style={s.name}>{product.name}</Text>
                    <View style={s.priceRow}>
                        {currentPrice ? (
                            <Text style={s.price}>${parseFloat(currentPrice).toFixed(2)}</Text>
                        ) : null}
                        {product.on_sale && product.regular_price && (
                            <Text style={s.oldPrice}>${parseFloat(product.regular_price).toFixed(2)}</Text>
                        )}
                        {product.on_sale && (
                            <View style={s.saleBadge}>
                                <Text style={s.saleBadgeText}>SALE</Text>
                            </View>
                        )}
                    </View>

                    {/* Rating */}
                    {parseFloat(product.average_rating) > 0 && (
                        <View style={s.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= Math.round(parseFloat(product.average_rating)) ? 'star' : 'star-outline'}
                                    size={16}
                                    color={colors.star}
                                />
                            ))}
                            <Text style={s.ratingText}>{parseFloat(product.average_rating).toFixed(1)}</Text>
                            <Text style={s.ratingCount}>({product.rating_count} reviews)</Text>
                        </View>
                    )}

                    {/* Stock */}
                    <View style={[s.stockBadge, { backgroundColor: inStock ? colors.success + '22' : colors.error + '22' }]}>
                        <Ionicons name={inStock ? 'checkmark-circle' : 'close-circle'} size={14} color={inStock ? colors.success : colors.error} />
                        <Text style={[s.stockText, { color: inStock ? colors.success : colors.error }]}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                        </Text>
                    </View>

                    {/* Attributes / Variants */}
                    {product.attributes?.filter((a) => a.variation).map((attr) => (
                        <View key={attr.id} style={s.attrGroup}>
                            <Text style={s.attrLabel}>{attr.name}</Text>
                            <View style={s.attrOptions}>
                                {attr.options.map((opt) => {
                                    const selected = selectedAttrs[attr.name] === opt;
                                    return (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[s.attrChip, selected && s.attrChipActive]}
                                            onPress={() => handleAttrSelect(attr.name, opt)}
                                        >
                                            <Text style={[s.attrChipText, selected && { color: '#fff' }]}>{opt}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    {/* Qty + Add to Cart */}
                    <View style={s.cartRow}>
                        <View style={s.qtyBox}>
                            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={s.qtyBtn}>
                                <Ionicons name="remove" size={18} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={s.qtyText}>{qty}</Text>
                            <TouchableOpacity onPress={() => setQty(qty + 1)} style={s.qtyBtn}>
                                <Ionicons name="add" size={18} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={s.addBtn} onPress={handleAddToCart} disabled={!inStock || addingToCart} activeOpacity={0.88}>
                            <LinearGradient colors={inStock ? [colors.primary, colors.primaryDark] : [colors.border, colors.border]} style={s.addBtnGrad}>
                                {addingToCart
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <>
                                        <Ionicons name="cart-outline" size={18} color="#fff" />
                                        <Text style={s.addBtnText}>{inStock ? 'Add to Cart' : 'Unavailable'}</Text>
                                    </>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs: Description / Reviews */}
                    <View style={s.tabRow}>
                        {(['desc', 'reviews'] as const).map((t) => (
                            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                                <Text style={[s.tabText, tab === t && { color: colors.primary }]}>
                                    {t === 'desc' ? 'Description' : `Reviews (${reviews?.length ?? 0})`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {tab === 'desc' ? (
                        <Text style={s.desc}>{product.description.replace(/<[^>]+>/g, '')}
                        </Text>
                    ) : (
                        <View>
                            {(reviews ?? []).length === 0 ? (
                                <Text style={s.noReviews}>No reviews yet</Text>
                            ) : (
                                (reviews ?? []).map((r: any) => (
                                    <View key={r.id} style={s.reviewCard}>
                                        <View style={s.reviewHeader}>
                                            <Text style={s.reviewer}>{r.reviewer}</Text>
                                            <View style={s.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons key={star} name={star <= r.rating ? 'star' : 'star-outline'} size={12} color={colors.star} />
                                                ))}
                                            </View>
                                        </View>
                                        <Text style={s.reviewText}>{r.review.replace(/<[^>]+>/g, '')}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
        dotActive: { backgroundColor: colors.primary, width: 18 },
        heartBtn: { position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
        backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
        content: { padding: spacing.base + 4, paddingBottom: 100 },
        name: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: 8 },
        priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
        price: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.primary },
        oldPrice: { fontSize: fonts.sizes.base, color: colors.textMuted, textDecorationLine: 'line-through' },
        saleBadge: { backgroundColor: colors.sale, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
        saleBadgeText: { color: '#fff', fontSize: fonts.sizes.xs, fontWeight: '700' },
        ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
        ratingText: { color: colors.star, fontWeight: '700', fontSize: fonts.sizes.sm, marginLeft: 4 },
        ratingCount: { color: colors.textMuted, fontSize: fonts.sizes.xs },
        stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, alignSelf: 'flex-start', marginBottom: 16 },
        stockText: { fontSize: fonts.sizes.xs, fontWeight: '700' },
        attrGroup: { marginBottom: 14 },
        attrLabel: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text, marginBottom: 8 },
        attrOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        attrChip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 7 },
        attrChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        attrChipText: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600' },
        cartRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.lg, marginTop: 4 },
        qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
        qtyBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.inputBg },
        qtyText: { width: 40, textAlign: 'center', fontSize: fonts.sizes.base, fontWeight: '700', color: colors.text },
        addBtn: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
        addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, gap: 8 },
        addBtnText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
        tabRow: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: colors.border, marginBottom: spacing.base },
        tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
        tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
        tabText: { fontSize: fonts.sizes.base, fontWeight: '600', color: colors.textSecondary },
        desc: { fontSize: fonts.sizes.sm, color: colors.textSecondary, lineHeight: 22 },
        noReviews: { fontSize: fonts.sizes.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
        reviewCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
        reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
        reviewer: { fontWeight: '700', fontSize: fonts.sizes.sm, color: colors.text },
        reviewStars: { flexDirection: 'row', gap: 2 },
        reviewText: { fontSize: fonts.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
    });
