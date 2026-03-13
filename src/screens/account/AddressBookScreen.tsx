import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { useAddressStore } from '../../stores/addressStore';

export default function AddressBookScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { user } = useAuthStore();
    const { lastBilling, lastShipping } = useAddressStore();

    const addresses = [
        { type: 'Billing', data: user?.billing?.first_name ? user.billing : lastBilling },
        { type: 'Shipping', data: user?.shipping?.first_name ? user.shipping : lastShipping },
    ];

    const s = st(colors, spacing, radius, fonts);

    return (
        <ScrollView style={s.flex} contentContainerStyle={s.content}>
            {addresses.map(({ type, data }) => (
                <View key={type} style={[s.card, shadows.sm]}>
                    <View style={s.cardHeader}>
                        <View style={s.iconWrap}>
                            <Ionicons name="location-outline" size={18} color={colors.primary} />
                        </View>
                        <Text style={s.cardType}>{type} Address</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddressForm', { type: type.toLowerCase(), address: data })}
                        >
                            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {data?.first_name ? (
                        <View style={s.addrInfo}>
                            <Text style={s.name}>{data.first_name} {data.last_name}</Text>
                            <Text style={s.line}>{data.address_1}</Text>
                            {data.address_2 ? <Text style={s.line}>{data.address_2}</Text> : null}
                            <Text style={s.line}>{data.city}, {data.state} {data.postcode}</Text>
                            <Text style={s.line}>{data.country}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={s.addBtn}
                            onPress={() => navigation.navigate('AddressForm', { type: type.toLowerCase(), address: data })}
                        >
                            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                            <Text style={s.addText}>Add {type} Address</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: c.background },
        content: { padding: sp.base, gap: sp.md, paddingBottom: 120 },
        card: { backgroundColor: c.card, borderRadius: r.lg, padding: sp.base },
        cardHeader: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginBottom: sp.md },
        iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary + '22', alignItems: 'center', justifyContent: 'center' },
        cardType: { flex: 1, fontWeight: '700', fontSize: f.sizes.base, color: c.text },
        addrInfo: { gap: 2 },
        name: { fontWeight: '700', fontSize: f.sizes.base, color: c.text },
        line: { fontSize: f.sizes.sm, color: c.textSecondary },
        addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        addText: { color: c.primary, fontWeight: '600', fontSize: f.sizes.sm },
    });
