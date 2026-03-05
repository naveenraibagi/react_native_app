import React, { useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';
import { validateCoupon } from '../../services/orders.service';
import EmptyState from '../../components/common/EmptyState';

export default function CartScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { items, updateQty, removeItem, couponCode, couponDiscount, applyCoupon, removeCoupon, subtotal } = useCartStore();
    const [couponInput, setCouponInput] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const sub = subtotal();
    const discount = couponDiscount;
    const shipping = sub > 0 ? 5.99 : 0;
    const total = sub - discount + shipping;

    const handleCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        try {
            const coupon = await validateCoupon(couponInput.trim());
            const discountAmt = coupon.discount_type === 'percent'
                ? (sub * parseFloat(coupon.amount)) / 100
                : parseFloat(coupon.amount);
            applyCoupon(couponInput.trim(), discountAmt);
            Alert.alert('Coupon Applied! 🎉', `You saved $${discountAmt.toFixed(2)}`);
            setCouponInput('');
        } catch {
            Alert.alert('Invalid Coupon', 'This coupon code is not valid or has expired.');
        } finally {
            setCouponLoading(false);
        }
    };

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
            <FlatList
                data={items}
                keyExtractor={(item) => `${item.product.id}-${item.variationId ?? 0}`}
                contentContainerStyle={{ padding: spacing.base, paddingBottom: 220 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const imgSrc = item.product.images?.[0]?.src;
                    return (
                        <View style={[s.card, shadows.sm]}>
                            <Image source={imgSrc ? { uri: imgSrc } : require('../../../assets/icon.png')} style={s.img} contentFit="cover" />
                            <View style={s.info}>
                                <Text style={s.name} numberOfLines={2}>{item.product.name}</Text>
                                {item.selectedAttributes && Object.entries(item.selectedAttributes).map(([k, v]) => (
                                    <Text key={k} style={s.attr}>{k}: {v}</Text>
                                ))}
                                <Text style={s.price}>${item.lineTotal.toFixed(2)}</Text>
                                <View style={s.qtyRow}>
                                    <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity - 1, item.variationId)}>
                                        <Ionicons name="remove" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text style={s.qty}>{item.quantity}</Text>
                                    <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.product.id, item.quantity + 1, item.variationId)}>
                                        <Ionicons name="add" size={16} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => removeItem(item.product.id, item.variationId)}>
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
                            <TouchableOpacity style={s.couponBtn} onPress={handleCoupon} disabled={couponLoading}>
                                <Text style={s.couponBtnText}>{couponLoading ? '...' : 'Apply'}</Text>
                            </TouchableOpacity>
                        </View>
                        {couponCode ? (
                            <View style={s.appliedCoupon}>
                                <Text style={s.appliedText}>🎉 {couponCode} applied — -${discount.toFixed(2)}</Text>
                                <TouchableOpacity onPress={removeCoupon}>
                                    <Ionicons name="close-circle" size={18} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {/* Summary */}
                        <View style={[s.summary, shadows.sm]}>
                            <View style={s.summaryRow}><Text style={s.summaryLabel}>Subtotal</Text><Text style={s.summaryValue}>${sub.toFixed(2)}</Text></View>
                            {discount > 0 && <View style={s.summaryRow}><Text style={[s.summaryLabel, { color: colors.success }]}>Discount</Text><Text style={[s.summaryValue, { color: colors.success }]}>-${discount.toFixed(2)}</Text></View>}
                            <View style={s.summaryRow}><Text style={s.summaryLabel}>Shipping</Text><Text style={s.summaryValue}>${shipping.toFixed(2)}</Text></View>
                            <View style={[s.summaryDivider, { borderTopColor: colors.border }]} />
                            <View style={s.summaryRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalValue}>${total.toFixed(2)}</Text></View>
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
        checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
        checkoutBtn: { borderRadius: radius.md, overflow: 'hidden' },
        checkoutGrad: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
        checkoutText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
    });
