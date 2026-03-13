import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Platform, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';
import { validateCoupon, fetchLatestCoupons } from '../../services/orders.service';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/currency';
import { activeConfig } from '../../config';

const LOGO_MAP: Record<string, any> = {
    'sbdh-crafts': require('../../../assets/apps/sbdh-crafts/icon.png'),
    'sbdh-pixels': require('../../../assets/apps/sbdh-pixels/icon.png'),
};


export default function CartScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { items, updateQty, removeItem, clearCart, couponCode, couponDiscount, applyCoupon, removeCoupon, subtotal } = useCartStore();
    const [couponInput, setCouponInput] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const { data: coupons } = useQuery<any[]>({
        queryKey: ['coupons', 'latest'],
        queryFn: fetchLatestCoupons,
    });

    const sub = subtotal();
    const discount = couponDiscount;
    const total = sub - discount;

    const handleCoupon = useCallback(async (inputCode?: string, isSilent = false) => {
        const codeToApply = inputCode || couponInput.trim();
        if (!codeToApply && !isSilent) return;
        if (!codeToApply && isSilent) {
            if (couponCode) removeCoupon();
            return;
        }
        
        if (!isSilent) setCouponLoading(true);
        try {
            const coupon = await validateCoupon(codeToApply);
            
            // 1. Check Expiry
            if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
                throw new Error('This coupon has expired.');
            }

            // 2. Check Minimum Spend
            const minSpend = parseFloat(coupon.minimum_amount || '0');
            if (minSpend > 0 && sub < minSpend) {
                throw new Error(`Minimum spend of ₹${minSpend} is required.`);
            }

            // 3. Check Maximum Spend
            const maxSpend = parseFloat(coupon.maximum_amount || '0');
            if (maxSpend > 0 && sub > maxSpend) {
                throw new Error(`Only valid for orders up to ₹${maxSpend}.`);
            }

            // 4. Check Product Restrictions
            if (coupon.product_ids?.length > 0) {
                const hasRequiredProduct = items.some(item => coupon.product_ids.includes(item.product.id));
                if (!hasRequiredProduct) {
                    throw new Error(`Valid only for specific items.`);
                }
            }

            // 5. Check Category Restrictions
            if (coupon.product_categories?.length > 0) {
                const hasRequiredCategory = items.some(item => 
                    item.product.categories?.some((cat: any) => coupon.product_categories.includes(cat.id))
                );
                if (!hasRequiredCategory) {
                    throw new Error(`Not valid for the items in your cart.`);
                }
            }

            // 6. Check Sale Items
            if (coupon.exclude_sale_items) {
                const hasSaleItems = items.some(item => item.product.on_sale);
                if (hasSaleItems) {
                    throw new Error(`Cannot be used with sale items.`);
                }
            }

            const discountAmt = coupon.discount_type === 'percent'
                ? (sub * parseFloat(coupon.amount)) / 100
                : parseFloat(coupon.amount);
                
            applyCoupon(codeToApply, discountAmt);
            if (!isSilent) {
                Alert.alert('Coupon Applied! 🎉', `You saved ${formatCurrency(discountAmt)}`);
                setCouponInput('');
            }
        } catch (err: any) {
            if (isSilent) {
                removeCoupon();
                Alert.alert('Coupon Removed', `The coupon "${codeToApply}" is no longer applicable: ${err.message}`);
            } else {
                Alert.alert('Coupon Error', err.message || 'This coupon code is not valid.');
            }
        } finally {
            if (!isSilent) setCouponLoading(false);
        }
    }, [couponInput, sub, items, couponCode, removeCoupon, applyCoupon]);

    // Re-validate coupon whenever items or subtotal changes
    useEffect(() => {
        if (couponCode) {
            handleCoupon(couponCode, true);
        }
    }, [items, sub]); // triggers on qty change or item removal

    const s = st(colors, spacing, radius, fonts);

    if (!items.length) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <EmptyState icon="cart-outline" title="Your Cart is Empty" subtitle="Add products to get started" />
            </View>
        );
    }

    return (
        <View style={s.flex}>
            <View style={s.header}>
                <Text style={s.headerTitle}>My Cart ({items.length})</Text>
                <TouchableOpacity onPress={() => Alert.alert('Clear Cart?', 'Are you sure you want to remove all items?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', onPress: clearCart, style: 'destructive' }])}>
                    <Text style={s.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item, index) => `${item.product.id}-${item.variationId ?? 0}-${JSON.stringify(item.ppomFields || {})}-${index}`}
                contentContainerStyle={{ padding: spacing.base, paddingBottom: 220 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const imgSrc = item.product.images?.[0]?.src;
                    const logoSource = LOGO_MAP[activeConfig.id] || require('../../../assets/icon.png');
                    return (
                        <View style={[s.card, shadows.sm]}>
                            <Image source={imgSrc ? { uri: imgSrc } : logoSource} style={s.img} contentFit="cover" />
                            <View style={s.info}>
                                <Text style={s.name} numberOfLines={2}>{item.product.name}</Text>
                                {item.selectedAttributes && Object.entries(item.selectedAttributes).map(([k, v]) => (
                                    <Text key={k} style={s.attr}>{k}: {v}</Text>
                                ))}
                                {item.ppomFields && Object.keys(item.ppomFields).length > 0 && (
                                    <View style={s.ppomBox}>
                                        {Object.entries(item.ppomFields).map(([label, val]: [string, any]) => (
                                            <Text key={label} style={s.attrText}>
                                                <Text style={{ fontWeight: '600' }}>{label}:</Text> {Array.isArray(val) ? val.join(', ') : String(val)}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                                <Text style={s.price}>{formatCurrency(item.lineTotal)}</Text>

                                <View style={s.qtyRow}>
                                    <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity - 1, item.variationId, item.ppomFields)}>
                                        <Ionicons name="remove" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text style={s.qty}>{item.quantity}</Text>
                                    <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity + 1, item.variationId, item.ppomFields)}>
                                        <Ionicons name="add" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => removeItem(item.product.id, item.variationId, item.ppomFields)}>
                                <Ionicons name="trash-outline" size={18} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListFooterComponent={
                    <View>
                        {/* Coupon */}
                        <View style={s.couponRow}>
                            <TextInput
                                style={s.couponInput}
                                placeholder="Coupon code"
                                placeholderTextColor={colors.textMuted}
                                value={couponInput}
                                onChangeText={setCouponInput}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity style={s.couponBtn} onPress={() => handleCoupon()} disabled={couponLoading}>
                                <Text style={s.couponBtnText}>{couponLoading ? '...' : 'Apply'}</Text>
                            </TouchableOpacity>
                        </View>
                        {couponCode ? (
                            <View style={s.appliedCoupon}>
                                <Text style={s.appliedText}>🎉 {couponCode} applied — -{formatCurrency(discount)}</Text>

                                <TouchableOpacity onPress={removeCoupon}>
                                    <Ionicons name="close-circle" size={18} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {/* Available Coupons */}
                        {!couponCode && coupons && coupons.length > 0 && (
                            <View style={s.availableSection}>
                                <Text style={s.sectionTitle}>Available Coupons</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.couponScroll}>
                                    {coupons
                                        .filter(c => {
                                            if (!c.date_expires) return true;
                                            return new Date(c.date_expires) > new Date();
                                        })
                                        .map((c) => {
                                            const isRestricted = c.product_ids?.length > 0;
                                            return (
                                                <TouchableOpacity 
                                                    key={c.id} 
                                                    style={[s.couponCard, { borderColor: colors.primary + '33' }]}
                                                    onPress={() => handleCoupon(c.code)}
                                                >
                                                    <View style={[s.couponDot, { left: -6 }]} />
                                                    <View style={[s.couponDot, { right: -6 }]} />
                                                    <Text style={s.couponCodeText}>{c.code}</Text>
                                                    <Text style={s.couponDiscountText}>
                                                        {c.discount_type === 'percent' ? `${c.amount}% OFF` : `₹${c.amount} OFF`}
                                                    </Text>
                                                    {isRestricted && (
                                                        <Text style={s.restrictedTag}>PROMO</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                </ScrollView>
                            </View>
                        )}

                        {/* Summary */}
                        <View style={[s.summary, shadows.sm]}>
                            <View style={s.summaryRow}><Text style={s.summaryLabel}>Subtotal</Text><Text style={s.summaryValue}>{formatCurrency(sub)}</Text></View>
                            {discount > 0 && <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.success }]}>Discount</Text><Text style={[s.summaryValue, { color: colors.success }]}>-{formatCurrency(discount)}</Text></View>}
                            <View style={[s.summaryDivider, { borderTopColor: colors.border }]} />
                            <View style={s.summaryRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalValue}>{formatCurrency(total)}</Text></View>
                        </View>
                    </View>
                }
            />

            {/* Checkout Button */}
            <View style={s.checkoutBar}>
                <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout')} activeOpacity={0.88}>
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.checkoutGrad}>
                        <Text style={s.checkoutText}>Proceed to Checkout</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
        clearText: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.error },
        card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', padding: spacing.md },
        img: { width: 80, height: 80, borderRadius: radius.md },
        info: { flex: 1, paddingHorizontal: spacing.md },
        name: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text },
        attr: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: 2 },
        price: { fontSize: fonts.sizes.base, fontWeight: '700', color: colors.primary, marginTop: 4 },
        qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 0 },
        qtyBtn: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center' },
        qty: { width: 32, textAlign: 'center', fontWeight: '700', color: colors.text },
        deleteBtn: { padding: 4, alignSelf: 'flex-start' },
        couponRow: { flexDirection: 'row', gap: 8, marginTop: spacing.lg },
        couponInput: { flex: 1, height: 46, backgroundColor: colors.inputBg, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text },
        couponBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 20, justifyContent: 'center' },
        couponBtnText: { color: '#fff', fontWeight: '700', fontSize: fonts.sizes.sm },
        appliedCoupon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.success + '22', borderRadius: radius.md, padding: spacing.md, marginTop: 8 },
        appliedText: { color: colors.success, fontWeight: '600', fontSize: fonts.sizes.sm },
        summary: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.base, marginTop: spacing.lg },
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
        summaryLabel: { fontSize: fonts.sizes.base, color: colors.textSecondary },
        summaryValue: { fontSize: fonts.sizes.base, color: colors.text, fontWeight: '600' },
        summaryDivider: { borderTopWidth: 1, marginVertical: 8 },
        totalLabel: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.text },
        totalValue: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.primary },
        checkoutBar: { position: 'absolute', bottom: Platform.OS === 'ios' ? 135 : 125, left: spacing.base, right: spacing.base, backgroundColor: 'transparent' },
        checkoutBtn: { borderRadius: radius.md, overflow: 'hidden' },
        checkoutGrad: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
        checkoutText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
        ppomBox: { marginTop: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.primary + '44' },
        attrText: { fontSize: fonts.sizes.xs, color: colors.textSecondary, marginBottom: 2 },
        availableSection: { marginTop: spacing.lg },
        sectionTitle: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
        couponScroll: { gap: 12 },
        couponCard: { 
            backgroundColor: colors.card, 
            paddingHorizontal: 16, 
            paddingVertical: 12, 
            borderRadius: radius.md, 
            borderWidth: 1, 
            borderStyle: 'dashed',
            minWidth: 120,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        couponDot: {
            position: 'absolute',
            top: '50%',
            marginTop: -6,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.background,
        },
        couponCodeText: { fontSize: 13, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
        couponDiscountText: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '600' },
        restrictedTag: { 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            backgroundColor: colors.primary, 
            paddingHorizontal: 6, 
            paddingVertical: 2, 
            borderBottomLeftRadius: radius.sm,
            fontSize: 8,
            fontWeight: '900',
            color: '#fff'
        }
    });
