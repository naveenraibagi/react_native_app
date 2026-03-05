import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fetchOrder } from '../../services/orders.service';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const STATUS_COLOR: Record<string, string> = {
    completed: '#10B981', processing: '#6C63FF', 'on-hold': '#F59E0B',
    pending: '#6B7280', cancelled: '#EF4444', failed: '#EF4444',
};

export default function OrderDetailScreen({ route }: any) {
    const { orderId } = route.params;
    const { colors, spacing, radius, fonts, shadows } = useTheme();

    const { data: order, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrder(orderId),
    });

    const s = st(colors, spacing, radius, fonts);
    if (isLoading || !order) return <SkeletonLoader rows={3} cols={1} cardHeight={120} />;

    const statusColor = STATUS_COLOR[order.status] ?? '#6B7280';

    return (
        <ScrollView style={s.flex} contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        >
            {/* Header */}
            <View style={[s.card, shadows.sm]}>
                <View style={s.row}>
                    <Text style={s.label}>Order</Text>
                    <Text style={s.val}>#{order.number}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Date</Text>
                    <Text style={s.val}>{format(new Date(order.date_created), 'MMM dd, yyyy HH:mm')}</Text>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Status</Text>
                    <View style={[s.badge, { backgroundColor: statusColor + '22' }]}>
                        <Text style={[s.badgeText, { color: statusColor }]}>{order.status}</Text>
                    </View>
                </View>
                <View style={s.row}>
                    <Text style={s.label}>Payment</Text>
                    <Text style={s.val}>{order.payment_method_title}</Text>
                </View>
            </View>

            {/* Items */}
            <Text style={s.sectionTitle}>Items</Text>
            {order.line_items.map((item) => (
                <View key={item.id} style={[s.itemCard, shadows.sm]}>
                    {item.image?.src ? (
                        <Image source={{ uri: item.image.src }} style={s.itemImg} contentFit="cover" />
                    ) : (
                        <View style={[s.itemImg, { backgroundColor: colors.inputBg }]} />
                    )}
                    <View style={s.itemInfo}>
                        <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                        <Text style={s.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={s.itemPrice}>{order.currency_symbol}{parseFloat(item.total).toFixed(2)}</Text>
                </View>
            ))}

            {/* Summary */}
            <View style={[s.card, shadows.sm]}>
                <Text style={s.sectionTitle}>Summary</Text>
                <View style={s.row}><Text style={s.label}>Subtotal</Text><Text style={s.val}>{order.currency_symbol}{parseFloat(order.subtotal ?? order.total).toFixed(2)}</Text></View>
                <View style={s.row}><Text style={s.label}>Shipping</Text><Text style={s.val}>{order.currency_symbol}{parseFloat(order.shipping_total).toFixed(2)}</Text></View>
                {parseFloat(order.discount_total) > 0 && <View style={s.row}><Text style={[s.label, { color: colors.success }]}>Discount</Text><Text style={[s.val, { color: colors.success }]}>-{order.currency_symbol}{parseFloat(order.discount_total).toFixed(2)}</Text></View>}
                <View style={[s.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
                    <Text style={s.totalLabel}>Total</Text>
                    <Text style={s.totalVal}>{order.currency_symbol}{parseFloat(order.total).toFixed(2)}</Text>
                </View>
            </View>

            {/* Shipping Address */}
            <Text style={s.sectionTitle}>Shipping Address</Text>
            <View style={[s.card, shadows.sm]}>
                <Text style={s.val}>{order.shipping.first_name} {order.shipping.last_name}</Text>
                <Text style={s.label}>{order.shipping.address_1}</Text>
                {order.shipping.address_2 ? <Text style={s.label}>{order.shipping.address_2}</Text> : null}
                <Text style={s.label}>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</Text>
                <Text style={s.label}>{order.shipping.country}</Text>
            </View>
        </ScrollView>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: c.background },
        content: { padding: sp.base, paddingBottom: 80 },
        sectionTitle: { fontSize: f.sizes.base, fontWeight: '700', color: c.text, marginTop: sp.lg, marginBottom: sp.sm },
        card: { backgroundColor: c.card, borderRadius: r.lg, padding: sp.base, marginBottom: sp.md },
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
        label: { fontSize: f.sizes.sm, color: c.textSecondary },
        val: { fontSize: f.sizes.sm, color: c.text, fontWeight: '600' },
        badge: { borderRadius: r.full, paddingHorizontal: 10, paddingVertical: 3 },
        badgeText: { fontSize: f.sizes.xs, fontWeight: '700', textTransform: 'capitalize' },
        itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: r.lg, padding: sp.md, marginBottom: sp.md, gap: sp.md },
        itemImg: { width: 56, height: 56, borderRadius: r.md },
        itemInfo: { flex: 1 },
        itemName: { fontSize: f.sizes.sm, fontWeight: '600', color: c.text },
        itemQty: { fontSize: f.sizes.xs, color: c.textSecondary, marginTop: 3 },
        itemPrice: { fontSize: f.sizes.sm, fontWeight: '700', color: c.primary },
        totalLabel: { fontSize: f.sizes.base, fontWeight: '700', color: c.text },
        totalVal: { fontSize: f.sizes.base, fontWeight: '800', color: c.primary },
    });
