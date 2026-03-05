import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { createOrder, markOrderPaid } from '../../services/orders.service';
import { WCAddress } from '../../types';

const BLANK_ADDR: WCAddress = {
    first_name: '', last_name: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: 'US',
};

export default function CheckoutScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { items, couponCode, couponDiscount, subtotal, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [billing, setBilling] = useState<WCAddress>(user?.billing ?? BLANK_ADDR);
    const [shipping, setShipping] = useState<WCAddress>(user?.shipping ?? BLANK_ADDR);
    const [sameAsBilling, setSameAsBilling] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
    const [loading, setLoading] = useState(false);

    const sub = subtotal();
    const discount = couponDiscount;
    const shippingCost = 5.99;
    const total = sub - discount + shippingCost;

    const s = st(colors, spacing, radius, fonts);

    const handlePlaceOrder = async () => {
        if (!billing.first_name || !billing.address_1 || !billing.city || !billing.postcode) {
            Alert.alert('Please fill in your billing address');
            return;
        }
        setLoading(true);
        try {
            const order = await createOrder({
                customerId: user?.id ?? 0,
                billing,
                shipping: sameAsBilling ? billing : shipping,
                lineItems: items,
                shippingMethodId: 'flat_rate',
                shippingMethodTitle: 'Flat Rate',
                shippingTotal: shippingCost.toFixed(2),
                couponCode,
                paymentMethod: paymentMethod === 'stripe' ? 'stripe' : 'cod',
                paymentMethodTitle: paymentMethod === 'stripe' ? 'Credit / Debit Card' : 'Cash on Delivery',
            });

            if (paymentMethod === 'cod') {
                // Mark instantly paid for COD
                clearCart();
                navigation.replace('OrderConfirmation', { orderId: order.id });
            } else {
                // Stripe — for demo we "pay" immediately; integrate StripeProvider for real
                await markOrderPaid(order.id);
                clearCart();
                navigation.replace('OrderConfirmation', { orderId: order.id });
            }
        } catch (e: any) {
            Alert.alert('Order Failed', e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={s.flex} contentContainerStyle={s.content}>
            {/* Billing Address */}
            <Text style={s.sectionTitle}>Billing Address</Text>
            <TouchableOpacity
                style={[s.addrCard, shadows.sm]}
                onPress={() => navigation.navigate('AddressForm', { type: 'billing', address: billing })}
            >
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <View style={s.addrInfo}>
                    {billing.first_name ? (
                        <>
                            <Text style={s.addrName}>{billing.first_name} {billing.last_name}</Text>
                            <Text style={s.addrLine}>{billing.address_1}, {billing.city}, {billing.state} {billing.postcode}</Text>
                        </>
                    ) : (
                        <Text style={s.addrPlaceholder}>Add billing address</Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Ship to same */}
            <TouchableOpacity style={s.checkRow} onPress={() => setSameAsBilling(!sameAsBilling)}>
                <View style={[s.checkbox, sameAsBilling && s.checkboxActive]}>
                    {sameAsBilling && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={s.checkLabel}>Ship to same address</Text>
            </TouchableOpacity>

            {/* Shipping Address */}
            {!sameAsBilling && (
                <>
                    <Text style={s.sectionTitle}>Shipping Address</Text>
                    <TouchableOpacity style={[s.addrCard, shadows.sm]} onPress={() => navigation.navigate('AddressForm', { type: 'shipping', address: shipping })}>
                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                        <View style={s.addrInfo}>
                            {shipping.first_name ? (
                                <>
                                    <Text style={s.addrName}>{shipping.first_name} {shipping.last_name}</Text>
                                    <Text style={s.addrLine}>{shipping.address_1}, {shipping.city}</Text>
                                </>
                            ) : (
                                <Text style={s.addrPlaceholder}>Add shipping address</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </>
            )}

            {/* Payment method */}
            <Text style={s.sectionTitle}>Payment Method</Text>
            {(['stripe', 'cod'] as const).map((m) => (
                <TouchableOpacity key={m} style={[s.payOption, paymentMethod === m && s.payOptionActive]} onPress={() => setPaymentMethod(m)}>
                    <View style={[s.radio, paymentMethod === m && s.radioActive]}>
                        {paymentMethod === m && <View style={s.radioDot} />}
                    </View>
                    <Ionicons name={m === 'stripe' ? 'card-outline' : 'cash-outline'} size={20} color={paymentMethod === m ? colors.primary : colors.textSecondary} />
                    <Text style={[s.payLabel, paymentMethod === m && { color: colors.primary }]}>
                        {m === 'stripe' ? 'Credit / Debit Card' : 'Cash on Delivery'}
                    </Text>
                </TouchableOpacity>
            ))}

            {/* Order Summary */}
            <Text style={s.sectionTitle}>Order Summary</Text>
            {items.map((item) => (
                <View key={`${item.product.id}-${item.variationId}`} style={s.lineItem}>
                    <Text style={s.lineText} numberOfLines={1}>{item.product.name} × {item.quantity}</Text>
                    <Text style={s.linePrice}>${item.lineTotal.toFixed(2)}</Text>
                </View>
            ))}
            <View style={[s.summary, shadows.sm]}>
                <View style={s.sumRow}><Text style={s.sumLabel}>Subtotal</Text><Text style={s.sumVal}>${sub.toFixed(2)}</Text></View>
                {discount > 0 && <View style={s.sumRow}><Text style={[s.sumLabel, { color: colors.success }]}>Coupon</Text><Text style={[s.sumVal, { color: colors.success }]}>-${discount.toFixed(2)}</Text></View>}
                <View style={s.sumRow}><Text style={s.sumLabel}>Shipping</Text><Text style={s.sumVal}>${shippingCost.toFixed(2)}</Text></View>
                <View style={[s.divider, { borderTopColor: colors.border }]} />
                <View style={s.sumRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalVal}>${total.toFixed(2)}</Text></View>
            </View>

            {/* Place Order */}
            <TouchableOpacity style={s.orderBtn} onPress={handlePlaceOrder} disabled={loading} activeOpacity={0.88}>
                <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.orderGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.orderText}>Place Order · ${total.toFixed(2)}</Text>}
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        content: { padding: spacing.base, paddingBottom: 60 },
        sectionTitle: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: spacing.lg },
        addrCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: 12 },
        addrInfo: { flex: 1 },
        addrName: { fontWeight: '700', fontSize: fonts.sizes.sm, color: colors.text },
        addrLine: { fontSize: fonts.sizes.xs, color: colors.textSecondary, marginTop: 2 },
        addrPlaceholder: { fontSize: fonts.sizes.sm, color: colors.textMuted },
        checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
        checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
        checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        checkLabel: { fontSize: fonts.sizes.sm, color: colors.text },
        payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1.5, borderColor: colors.border, marginBottom: 10 },
        payOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
        radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
        radioActive: { borderColor: colors.primary },
        radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
        payLabel: { flex: 1, fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text },
        lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
        lineText: { flex: 1, fontSize: fonts.sizes.sm, color: colors.textSecondary },
        linePrice: { fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.text },
        summary: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.base, marginTop: spacing.md },
        sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
        sumLabel: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
        sumVal: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600' },
        divider: { borderTopWidth: 1, marginVertical: 8 },
        totalLabel: { fontSize: fonts.sizes.base, fontWeight: '700', color: colors.text },
        totalVal: { fontSize: fonts.sizes.base, fontWeight: '800', color: colors.primary },
        orderBtn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.lg },
        orderGrad: { paddingVertical: 16, alignItems: 'center' },
        orderText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
    });
