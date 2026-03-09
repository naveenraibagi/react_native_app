import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { fetchOrders } from '../../services/orders.service';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const STATUS_COLORS: Record<string, string> = {
    completed: '#10B981',
    processing: '#6C63FF',
    'on-hold': '#F59E0B',
    pending: '#6B7280',
    cancelled: '#EF4444',
    refunded: '#F59E0B',
    failed: '#EF4444',
};

export default function OrderHistoryScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { user } = useAuthStore();

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['orders', user?.id],
        queryFn: () => fetchOrders(user?.id ?? 0),
        enabled: !!user?.id,
    });

    const s = st(colors, spacing, radius, fonts);

    if (isLoading) return <SkeletonLoader rows={4} cols={1} cardHeight={90} />;
    if (!data?.length) return <EmptyState icon="receipt-outline" title="No Orders Yet" subtitle="Your orders will appear here after you shop" />;

    return (
        <FlatList
            data={data}
            keyExtractor={(o) => String(o.id)}
            contentContainerStyle={{ padding: spacing.base, gap: spacing.md, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />}
            renderItem={({ item: order }) => (
                <TouchableOpacity style={[s.card, shadows.sm]} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} activeOpacity={0.88}>
                    <View style={s.topRow}>
                        <View>
                            <Text style={s.orderNum}>Order #{order.number}</Text>
                            <Text style={s.date}>{format(new Date(order.date_created), 'MMM dd, yyyy')}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] ?? '#6B7280') + '22' }]}>
                            <Text style={[s.statusText, { color: STATUS_COLORS[order.status] ?? '#6B7280' }]}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Text>
                        </View>
                    </View>
                    <View style={s.bottomRow}>
                        <Text style={s.items}>{order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}</Text>
                        <Text style={s.total}>{order.currency_symbol}{parseFloat(order.total).toFixed(2)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={s.arrow} />
                </TouchableOpacity>
            )}
        />
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        card: { backgroundColor: c.card, borderRadius: r.lg, padding: sp.base, position: 'relative' },
        topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sp.sm },
        orderNum: { fontWeight: '700', fontSize: f.sizes.base, color: c.text },
        date: { fontSize: f.sizes.xs, color: c.textMuted, marginTop: 2 },
        statusBadge: { borderRadius: r.full, paddingHorizontal: 10, paddingVertical: 4 },
        statusText: { fontSize: f.sizes.xs, fontWeight: '700' },
        bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        items: { fontSize: f.sizes.sm, color: c.textSecondary },
        total: { fontSize: f.sizes.lg, fontWeight: '700', color: c.primary },
        arrow: { position: 'absolute', right: sp.base, top: sp.base },
    });
