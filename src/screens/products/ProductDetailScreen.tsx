import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
    FlatList, Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import {
    fetchProductById, fetchProductVariations, fetchProductReviews, createProductReview,
    fetchProductPPOMFields,
} from '../../services/products.service';
import { fetchLatestCoupons } from '../../services/orders.service';
import { useCartStore } from '../../stores/cartStore';
import { ACTIVE_APP_ID } from '../../config';
import { useAuthStore } from '../../stores/authStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore';
import ProductCard from '../../components/product/ProductCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/currency';


const { width: W, height: H } = Dimensions.get('window');

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
    const [showAdded, setShowAdded] = useState(false);
    const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
    const [showFullImage, setShowFullImage] = useState(false);

    const { user } = useAuthStore();
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewName, setReviewName] = useState(user?.first_name ? `${user.first_name} ${user.last_name}` : '');
    const [reviewEmail, setReviewEmail] = useState(user?.email ?? '');
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [ppomValues, setPpomValues] = useState<Record<string, any>>({});

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProductById(productId),
    });

    const { data: variations } = useQuery({
        queryKey: ['variations', productId],
        queryFn: () => fetchProductVariations(productId),
        enabled: product?.type === 'variable',
    });

    const { data: reviews, refetch: refetchReviews } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => fetchProductReviews(productId),
    });

    const { data: ppomFields } = useQuery({
        queryKey: ['ppom', productId],
        queryFn: () => fetchProductPPOMFields(productId),
        enabled: ACTIVE_APP_ID !== 'sbdh-pixels',
    });

    const { data: coupons } = useQuery({
        queryKey: ['coupons', 'latest'],
        queryFn: fetchLatestCoupons,
    });

    const applicableCoupon = coupons?.find((c: any) => 
        c.product_ids?.includes(parseInt(productId)) || 
        product?.categories?.some((cat: any) => c.product_categories?.includes(cat.id))
    );

    const { addItem: addRecentlyViewed } = useRecentlyViewedStore();

    useEffect(() => {
        if (product) {
            addRecentlyViewed(product);
        }
    }, [product]);

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

    const validatePPOMFields = () => {
        if (ACTIVE_APP_ID === 'sbdh-pixels') return true;
        if (!ppomFields) return true;
        const fieldsList = Array.isArray(ppomFields) ? ppomFields : Object.values(ppomFields);
        
        for (const field of fieldsList) {
            const isRequired = field.required === 'on' || field.required === 'yes' || field.required === 'sh';
            if (isRequired) {
                const dataName = field.data_name || field.id;
                const value = ppomValues[dataName];
                
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    Alert.alert('Required Field', `Please fill in the "${field.title || field.data_name}" field.`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleAddToCart = async () => {
        if (product.type === 'variable' && !selectedVariation) {
            Alert.alert('Please select all options');
            return;
        }

        if (!validatePPOMFields()) {
            return;
        }

        setAddingToCart(true);
        addItem(product, qty, selectedVariation?.id, selectedAttrs, ppomValues);
        setTimeout(() => {
            setAddingToCart(false);
            setShowAdded(true);
            setTimeout(() => setShowAdded(false), 2000);
            Alert.alert('Added to Cart! 🛒', product.name, [
                { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
                { text: 'Continue Shopping' },
            ]);
        }, 400);
    };

    const onSubmitReview = async () => {
        if (!reviewName || !reviewEmail || !reviewText) {
            Alert.alert('Please fill in all fields');
            return;
        }
        setSubmittingReview(true);
        try {
            await createProductReview(productId, reviewName, reviewEmail, reviewText, reviewRating);
            Alert.alert('Success', 'Your review has been submitted');
            setReviewText('');
            refetchReviews();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? e.message);
        } finally {
            setSubmittingReview(false);
        }
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
                            <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => setShowFullImage(true)}>
                                <Image source={{ uri: img.src }} style={{ width: W, height: W * 0.85 }} contentFit="cover" />
                            </TouchableOpacity>
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
                            <Text style={s.price}>{formatCurrency(currentPrice)}</Text>
                        ) : null}
                        {product.on_sale && product.regular_price && (
                            <Text style={s.oldPrice}>{formatCurrency(product.regular_price)}</Text>
                        ) || null}
                        {product.on_sale && (
                            <View style={s.saleBadge}>
                                <Text style={s.saleBadgeText}>SALE</Text>
                            </View>
                        ) || null}
                    </View>

                    {/* Coupon Suggestion */}
                    {applicableCoupon && (
                        <View style={s.suggestionBanner}>
                            <Ionicons name="pricetag" size={16} color={colors.primary} />
                            <Text style={s.suggestionText}>
                                Use coupon <Text style={s.suggestionCode}>{applicableCoupon.code}</Text> for <Text style={s.suggestionAmount}>{applicableCoupon.discount_type === 'percent' ? `${applicableCoupon.amount}%` : formatCurrency(applicableCoupon.amount)}</Text> OFF!
                            </Text>
                        </View>
                    )}

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
                    {product.attributes?.filter((a) => a.variation).map((attr, idx) => (
                        <View key={`${attr.id}-${attr.name}-${idx}`} style={s.attrGroup}>
                            <Text style={s.attrLabel}>{attr.name}</Text>
                            <View style={s.attrOptions}>
                                {attr.options.map((opt, oIdx) => {
                                    const selected = selectedAttrs[attr.name] === opt;
                                    return (
                                        <TouchableOpacity
                                            key={`${attr.name}-${opt}-${oIdx}`}
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

                    {/* PPOM Fields */}
                    {(() => {
                        if (ACTIVE_APP_ID === 'sbdh-pixels') return null;
                        if (!ppomFields) return null;
                        const fieldsList = Array.isArray(ppomFields) ? ppomFields : Object.values(ppomFields);
                        if (fieldsList.length === 0) return null;

                        return (
                            <View style={s.ppomSection}>
                                {fieldsList.map((field: any, idx: number) => {
                                    const fieldTitle = field.title || field.data_name || `Field ${idx + 1}`;
                                    const fieldType = field.type || 'text'; // Fallback to text
                                    const dataName = field.data_name || field.id || `field_${idx}`;
                                    const isRequired = field.required === 'on' || field.required === 'yes';

                                    // Normalize options to an array
                                    let options = [];
                                    if (field.options) {
                                        options = Array.isArray(field.options) ? field.options : Object.values(field.options);
                                    }

                                    return (
                                        <View key={`${dataName}-${idx}`} style={s.ppomField}>
                                            <Text style={s.ppomLabel}>
                                                {fieldTitle} {isRequired && <Text style={{ color: colors.error }}>*</Text>}
                                            </Text>

                                            {(fieldType === 'text' || fieldType === 'textarea' || fieldType === 'email' || fieldType === 'number' || fieldType === 'date' || fieldType === 'input' || fieldType === 'url') && (
                                                <TextInput
                                                    style={[s.ppomInput, fieldType === 'textarea' && { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                                                    placeholder={field.description || `Enter ${fieldTitle}`}
                                                    placeholderTextColor={colors.textMuted}
                                                    multiline={fieldType === 'textarea'}
                                                    keyboardType={fieldType === 'number' ? 'numeric' : (fieldType === 'email' ? 'email-address' : 'default')}
                                                    value={ppomValues[dataName] || ''}
                                                    onChangeText={(val) => setPpomValues(prev => ({ ...prev, [dataName]: val }))}
                                                />
                                            )}

                                            {(fieldType === 'select' || fieldType === 'radio') && (
                                                <View style={s.attrOptions}>
                                                    {options.map((opt: any, oIdx: number) => {
                                                        const optLabel = typeof opt === 'string' ? opt : (opt.option || opt.label || String(oIdx));
                                                        const selected = ppomValues[dataName] === optLabel;
                                                        return (
                                                            <TouchableOpacity
                                                                key={`${dataName}-${optLabel}-${oIdx}`}
                                                                style={[s.attrChip, selected && s.attrChipActive]}
                                                                    onPress={() => setPpomValues(prev => ({ ...prev, [dataName]: optLabel }))}
                                                            >
                                                                <Text style={[s.attrChipText, selected && { color: '#fff' }]}>{optLabel}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            )}

                                            {(fieldType === 'checkbox') && (
                                                <View style={s.attrOptions}>
                                                    {options.map((opt: any, oIdx: number) => {
                                                        const optLabel = typeof opt === 'string' ? opt : (opt.option || opt.label || String(oIdx));
                                                        const currentVals = ppomValues[dataName] || [];
                                                        const selected = Array.isArray(currentVals) && currentVals.includes(optLabel);
                                                        return (
                                                            <TouchableOpacity
                                                                key={`${dataName}-${optLabel}-${oIdx}`}
                                                                style={[s.attrChip, selected && s.attrChipActive]}
                                                                onPress={() => {
                                                                    const next = selected
                                                                        ? currentVals.filter((v: string) => v !== optLabel)
                                                                        : [...(Array.isArray(currentVals) ? currentVals : []), optLabel];
                                                                    setPpomValues(prev => ({ ...prev, [dataName]: next }));
                                                                }}
                                                            >
                                                                <Text style={[s.attrChipText, selected && { color: '#fff' }]}>{optLabel}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            )}

                                            {/* Catch-all for other types like Image/File (basic text for now) */}
                                            {fieldTitle && !['text', 'textarea', 'email', 'number', 'date', 'input', 'url', 'select', 'radio', 'checkbox'].includes(fieldType) && (
                                                <View style={{ backgroundColor: colors.border + '33', padding: 10, borderRadius: radius.md }}>
                                                    <Text style={{ fontSize: fonts.sizes.xs, color: colors.textSecondary }}>
                                                        Type: {fieldType} (Not yet fully supported)
                                                    </Text>
                                                    <TextInput
                                                        style={s.ppomInput}
                                                        placeholder={`Enter ${fieldTitle} value`}
                                                        placeholderTextColor={colors.textMuted}
                                                        value={ppomValues[dataName] || ''}
                                                        onChangeText={(val) => setPpomValues(prev => ({ ...prev, [dataName]: val }))}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })()}

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
                            <LinearGradient colors={showAdded ? [colors.success, colors.success] : (inStock ? [colors.primary, colors.primaryDark] : [colors.border, colors.border])} style={s.addBtnGrad}>
                                {addingToCart
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <>
                                        <Ionicons name={showAdded ? "checkmark" : "cart-outline"} size={18} color="#fff" />
                                        <Text style={s.addBtnText}>{showAdded ? 'Added to Cart' : (inStock ? 'Add to Cart' : 'Unavailable')}</Text>
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
                            <View style={s.addReviewCard}>
                                <Text style={s.reviewHeading}>Write a Review</Text>
                                <View style={s.starPicker}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                                            <Ionicons name={star <= reviewRating ? 'star' : 'star-outline'} size={24} color={colors.star} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={s.reviewInput}
                                    placeholder="Your Name"
                                    placeholderTextColor={colors.textMuted}
                                    value={reviewName}
                                    onChangeText={setReviewName}
                                />
                                <TextInput
                                    style={s.reviewInput}
                                    placeholder="Your Email"
                                    placeholderTextColor={colors.textMuted}
                                    value={reviewEmail}
                                    onChangeText={setReviewEmail}
                                    keyboardType="email-address"
                                />
                                <TextInput
                                    style={[s.reviewInput, { height: 80 }]}
                                    placeholder="Share your experience..."
                                    placeholderTextColor={colors.textMuted}
                                    value={reviewText}
                                    onChangeText={setReviewText}
                                    multiline
                                />
                                <TouchableOpacity style={s.submitReviewBtn} onPress={onSubmitReview} disabled={submittingReview}>
                                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.submitReviewGrad}>
                                        {submittingReview ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.submitReviewText}>Submit Review</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {(reviews ?? []).length === 0 ? (
                                <Text style={s.noReviews}>No reviews yet</Text>
                            ) : (
                                (reviews ?? []).map((r: any, rIdx: number) => (
                                    <View key={`${r.id}-${rIdx}`} style={s.reviewCard}>
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

            {/* Full Screen Image Modal */}
            <Modal
                visible={showFullImage}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setShowFullImage(false)}
            >
                <View style={[s.modalContainer, { backgroundColor: '#000' }]}>
                    <Image
                        source={{ uri: images[activeImgIdx]?.src }}
                        style={s.fullImage}
                        contentFit="contain"
                    />
                    <TouchableOpacity
                        style={s.closeBtn}
                        onPress={() => setShowFullImage(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
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
        content: { padding: spacing.base + 4, paddingBottom: 140 },
        modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        fullImage: { width: W, height: H },
        closeBtn: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
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
        addReviewCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
        reviewHeading: { fontSize: fonts.sizes.base, fontWeight: '700', color: colors.text, marginBottom: 12 },
        starPicker: { flexDirection: 'row', gap: 8, marginBottom: 16 },
        reviewInput: { backgroundColor: colors.inputBg, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 12, color: colors.text, fontSize: fonts.sizes.sm },
        submitReviewBtn: { borderRadius: radius.sm, overflow: 'hidden', marginTop: 4 },
        submitReviewGrad: { paddingVertical: 12, alignItems: 'center' },
        submitReviewText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.sm },
        ppomSection: { marginTop: 10, marginBottom: 20 },
        ppomField: { marginBottom: 15 },
        ppomLabel: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.text, marginBottom: 8 },
        ppomInput: { height: 46, backgroundColor: colors.inputBg, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, color: colors.text, fontSize: fonts.sizes.sm },
        suggestionBanner: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: colors.primary + '11', 
            paddingHorizontal: 12, 
            paddingVertical: 10, 
            borderRadius: radius.md, 
            marginTop: 12, 
            borderWidth: 1, 
            borderColor: colors.primary + '33',
            gap: 8
        },
        suggestionText: { fontSize: fonts.sizes.sm, color: colors.textSecondary, flex: 1 },
        suggestionCode: { fontWeight: '800', color: colors.primary },
        suggestionAmount: { fontWeight: '700', color: colors.success },
    });
