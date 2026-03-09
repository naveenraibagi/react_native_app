import React, { useState, useEffect } from 'react';

import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { createOrder, markOrderPaid, fetchPaymentGateways, fetchShippingMethods } from '../../services/orders.service';
import { WCAddress } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useQuery } from '@tanstack/react-query';



const BLANK_ADDR: WCAddress = {
    first_name: '', last_name: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: 'IN', phone: '',
};

export default function CheckoutScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { items, couponCode, couponDiscount, subtotal, clearCart } = useCartStore();
    const { user } = useAuthStore();

    const [billing, setBilling] = useState<WCAddress>(user?.billing ?? BLANK_ADDR);
    const [shipping, setShipping] = useState<WCAddress>(user?.shipping ?? BLANK_ADDR);
    const [sameAsBilling, setSameAsBilling] = useState(true);
    const [selectedGateway, setSelectedGateway] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const { data: gateways, isLoading: gatewaysLoading } = useQuery<any[]>({
        queryKey: ['paymentGateways'],
        queryFn: fetchPaymentGateways,
    });

    const { data: shippingMethods, isLoading: shippingLoading } = useQuery<any[]>({
        queryKey: ['shippingMethods', billing.country],
        queryFn: () => fetchShippingMethods(billing.country),
    });

    const [selectedShipping, setSelectedShipping] = useState<any>(null);

    useEffect(() => {
        if (gateways && gateways.length > 0 && !selectedGateway) {
            setSelectedGateway(gateways[0]);
        }
    }, [gateways]);

    useEffect(() => {
        if (shippingMethods && shippingMethods.length > 0 && !selectedShipping) {
            setSelectedShipping(shippingMethods[0]);
        }
    }, [shippingMethods]);


    const sub = subtotal();
    const discount = couponDiscount;
    const shippingCost = parseFloat(selectedShipping?.settings?.cost?.value || '0');
    const total = sub - discount + shippingCost;

    const s = st(colors, spacing, radius, fonts);

    const handlePlaceOrder = async () => {
        if (!billing.first_name || !billing.address_1 || !billing.city || !billing.postcode || !billing.email) {
            Alert.alert('Please fill in your billing address including email');
            return;
        }
        setLoading(true);
        try {
            // 1. Create Order
            const order = await createOrder({
                customerId: user?.id ?? 0,
                billing,
                shipping: sameAsBilling ? billing : shipping,
                lineItems: items,
                shippingMethodId: selectedShipping?.method_id ?? 'flat_rate',
                shippingMethodTitle: selectedShipping?.method_title ?? 'Flat Rate',
                shippingTotal: shippingCost.toFixed(2),
                couponCode,
                paymentMethod: selectedGateway?.id ?? 'cod',
                paymentMethodTitle: selectedGateway?.title ?? 'Cash on Delivery',
            });

            // 2. Handle Payment/Confirmation
            if (selectedGateway?.id === 'cod') {
                clearCart();
            } else {
                await markOrderPaid(order.id);
                clearCart();
            }

            // 3. Guest Account Creation (Proactive)
            if (!user) {
                try {
                    const { registerUser, loginUser } = require('../../services/auth.service');
                    // Register using email as username and phone as temp password
                    const newUser = await registerUser(
                        billing.email,
                        billing.phone || 'password123',
                        billing.first_name,
                        billing.last_name
                    );

                    // Automatically log in
                    const { token, user: loggedInUser } = await loginUser(billing.email, billing.phone || 'password123');
                    const { useAuthStore } = require('../../stores/authStore');
                    useAuthStore.getState().setAuth(loggedInUser, token);
                } catch (regErr) {
                    console.warn('Auto-registration failed:', regErr);
                    // We don't block order flow if registration fails (e.g. user already exists)
                }
            }

            navigation.replace('OrderConfirmation', { orderId: order.id });

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
                onPress={() => navigation.navigate('AddressForm', {
                    type: 'billing',
                    address: billing,
                    onSave: (addr: WCAddress) => setBilling(addr)
                })}
            >
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <View style={s.addrInfo}>
                    {billing.first_name ? (
                        <>
                            <Text style={s.addrName}>{billing.first_name} {billing.last_name}</Text>
                            <Text style={s.addrLine}>{billing.address_1}, {billing.city}, {billing.state} {billing.postcode}</Text>
                            <Text style={s.addrLine}>{billing.email}</Text>
                            <Text style={s.addrLine}>{billing.phone}</Text>
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
                    <TouchableOpacity
                        style={[s.addrCard, shadows.sm]}
                        onPress={() => navigation.navigate('AddressForm', {
                            type: 'shipping',
                            address: shipping,
                            onSave: (addr: WCAddress) => setShipping(addr)
                        })}
                    >
                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                        <View style={s.addrInfo}>
                            {shipping.first_name ? (
                                <>
                                    <Text style={s.addrName}>{shipping.first_name} {shipping.last_name}</Text>
                                    <Text style={s.addrLine}>{shipping.address_1}, {shipping.city}</Text>
                                    <Text style={s.addrLine}>{shipping.phone}</Text>
                                </>
                            ) : (
                                <Text style={s.addrPlaceholder}>Add shipping address</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </>
            )}

            {/* Shipping Method */}
            <Text style={s.sectionTitle}>Shipping Method</Text>
            {shippingLoading ? <ActivityIndicator size="small" color={colors.primary} /> :
                shippingMethods?.length === 0 ? <Text style={s.noMethods}>No shipping methods available for this location</Text> :
                    shippingMethods?.map((m: any) => (
                        <TouchableOpacity
                            key={m.instance_id}
                            style={[s.payOption, selectedShipping?.instance_id === m.instance_id && s.payOptionActive]}
                            onPress={() => setSelectedShipping(m)}
                        >
                            <View style={[s.radio, selectedShipping?.instance_id === m.instance_id && s.radioActive]}>
                                {selectedShipping?.instance_id === m.instance_id && <View style={s.radioDot} />}
                            </View>
                            <Ionicons
                                name="bus-outline"
                                size={20}
                                color={selectedShipping?.instance_id === m.instance_id ? colors.primary : colors.textSecondary}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[s.payLabel, selectedShipping?.instance_id === m.instance_id && { color: colors.primary }]}>
                                    {m.method_title}
                                </Text>
                                {m.settings?.cost?.value && (
                                    <Text style={s.shipCost}>{formatCurrency(m.settings.cost.value)}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
            }
            <Text style={s.sectionTitle}>Payment Method</Text>
            {gatewaysLoading ? <ActivityIndicator size="small" color={colors.primary} /> :
                gateways?.map((m: any) => (
                    <TouchableOpacity
                        key={m.id}
                        style={[s.payOption, selectedGateway?.id === m.id && s.payOptionActive]}
                        onPress={() => setSelectedGateway(m)}
                    >
                        <View style={[s.radio, selectedGateway?.id === m.id && s.radioActive]}>
                            {selectedGateway?.id === m.id && <View style={s.radioDot} />}
                        </View>
                        <Ionicons
                            name={m.id === 'cod' ? 'cash-outline' : 'payment-outline'}
                            size={20}
                            color={selectedGateway?.id === m.id ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[s.payLabel, selectedGateway?.id === m.id && { color: colors.primary }]}>
                            {m.title}
                        </Text>
                    </TouchableOpacity>
                ))
            }


            {/* Order Summary */}
            <Text style={s.sectionTitle}>Order Summary</Text>
            {items.map((item) => (
                <View key={`${item.product.id}-${item.variationId}`} style={s.lineItem}>
                    <Text style={s.lineText} numberOfLines={1}>{item.product.name} × {item.quantity}</Text>
                    <Text style={s.linePrice}>{formatCurrency(item.lineTotal)}</Text>
                </View>
            ))}
            <View style={[s.summary, shadows.sm]}>
                <View style={s.sumRow}><Text style={s.sumLabel}>Subtotal</Text><Text style={s.sumVal}>{formatCurrency(sub)}</Text></View>
                {discount > 0 && <View style={s.sumRow}><Text style={[s.sumLabel, { color: colors.success }]}>Coupon</Text><Text style={[s.sumVal, { color: colors.success }]}>-{formatCurrency(discount)}</Text></View>}
                <View style={s.sumRow}><Text style={s.sumLabel}>Shipping</Text><Text style={s.sumVal}>{formatCurrency(shippingCost)}</Text></View>
                <View style={[s.divider, { borderTopColor: colors.border }]} />
                <View style={s.sumRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalVal}>{formatCurrency(total)}</Text></View>
            </View>

            {/* Place Order */}
            <TouchableOpacity style={s.orderBtn} onPress={handlePlaceOrder} disabled={loading} activeOpacity={0.88}>
                <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.orderGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.orderText}>Place Order · {formatCurrency(total)}</Text>}
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        content: { padding: spacing.base, paddingBottom: 140 },
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
        noMethods: { fontSize: fonts.sizes.sm, color: colors.textMuted, paddingVertical: 10 },
        shipCost: { fontSize: fonts.sizes.xs, color: colors.textSecondary, marginTop: 2 },
    });
