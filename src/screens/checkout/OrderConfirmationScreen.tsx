import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { fetchOrder } from '../../services/orders.service';

export default function OrderConfirmationScreen({ route, navigation }: any) {
    const { orderId } = route.params;
    const { colors, spacing, radius, fonts } = useTheme();
    const scale = React.useRef(new Animated.Value(0)).current;

    const { data: order } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrder(orderId),
    });

    useEffect(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50 }).start();
    }, []);

    const s = st(colors, spacing, radius, fonts);

    return (
        <View style={s.flex}>
            <LinearGradient colors={[colors.primary + '22', colors.background]} style={s.flex}>
                <View style={s.content}>
                    <Animated.View style={[s.iconWrap, { transform: [{ scale }] }]}>
                        <LinearGradient colors={[colors.success, '#059669']} style={s.iconGrad}>
                            <Ionicons name="checkmark" size={56} color="#fff" />
                        </LinearGradient>
                    </Animated.View>
                    <Text style={s.title}>Order Confirmed! 🎉</Text>
                    <Text style={s.orderNum}>Order #{order?.number ?? orderId}</Text>
                    <Text style={s.message}>
                        Thank you for your purchase! Your order has been placed and is being processed.
                        You'll receive a confirmation email shortly.
                    </Text>

                    {order && (
                        <View style={s.summaryBox}>
                            <View style={s.sumRow}><Text style={s.sumLabel}>Order Total</Text><Text style={s.sumVal}>{order.currency_symbol}{parseFloat(order.total).toFixed(2)}</Text></View>
                            <View style={s.sumRow}><Text style={s.sumLabel}>Payment</Text><Text style={s.sumVal}>{order.payment_method_title}</Text></View>
                            <View style={s.sumRow}><Text style={s.sumLabel}>Status</Text><Text style={[s.sumVal, { color: colors.success, textTransform: 'capitalize' }]}>{order.status}</Text></View>
                        </View>
                    )}

                    <TouchableOpacity style={s.trackBtn} onPress={() => navigation.navigate('AccountTab', { screen: 'OrderDetail', params: { orderId } })} activeOpacity={0.88}>
                        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.trackGrad}>
                            <Ionicons name="receipt-outline" size={18} color="#fff" />
                            <Text style={s.trackText}>Track Order</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={s.contBtn} onPress={() => navigation.navigate('HomeTab')} activeOpacity={0.88}>
                        <Text style={s.contText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1 },
        content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.xl },
        iconWrap: { marginBottom: sp.xl },
        iconGrad: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
        title: { fontSize: f.sizes.xxl, fontWeight: '800', color: c.text, marginBottom: 6 },
        orderNum: { fontSize: f.sizes.base, color: c.textSecondary, marginBottom: sp.base },
        message: { fontSize: f.sizes.sm, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: sp.xl },
        summaryBox: { width: '100%', backgroundColor: c.card, borderRadius: r.lg, padding: sp.base, marginBottom: sp.xl },
        sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
        sumLabel: { fontSize: f.sizes.sm, color: c.textSecondary },
        sumVal: { fontSize: f.sizes.sm, fontWeight: '700', color: c.text },
        trackBtn: { width: '100%', borderRadius: r.md, overflow: 'hidden', marginBottom: sp.md },
        trackGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
        trackText: { color: '#fff', fontWeight: '700', fontSize: f.sizes.base },
        contBtn: { paddingVertical: 12 },
        contText: { color: c.primary, fontWeight: '600', fontSize: f.sizes.base },
    });
