import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { updateCustomer } from '../../services/auth.service';

export default function ProfileScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const { user, updateUser, logout } = useAuthStore();
    const { mode, setMode } = useThemeStore();
    const [firstName, setFirstName] = useState(user?.first_name ?? '');
    const [lastName, setLastName] = useState(user?.last_name ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const updated = await updateCustomer(user.id, { first_name: firstName, last_name: lastName });
            updateUser(updated);
            Alert.alert('Profile Updated!');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    const s = st(colors, spacing, radius, fonts);

    const themeOptions: { label: string; val: 'light' | 'dark' | 'system'; icon: string }[] = [
        { label: 'Light', val: 'light', icon: 'sunny-outline' },
        { label: 'Dark', val: 'dark', icon: 'moon-outline' },
        { label: 'System', val: 'system', icon: 'phone-portrait-outline' },
    ];

    if (!user) {
        return (
            <View style={[s.flex, { justifyContent: 'center', padding: spacing.xl }]}>
                <View style={{ alignItems: 'center', marginBottom: spacing.xl * 2 }}>
                    <View style={[s.avatar, { backgroundColor: colors.primary + '11', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, borderRadius: 50, marginBottom: spacing.lg }]}>
                        <Ionicons name="person-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[s.avatarName, { color: colors.text, fontSize: fonts.sizes.xl }]}>Welcome, Guest</Text>
                    <Text style={[s.avatarEmail, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>Sign in to track your orders, manage addresses, and more.</Text>
                </View>

                <TouchableOpacity
                    style={[s.saveBtn, { marginTop: 0 }]}
                    onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                >
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.saveBtnGrad}>
                        <Text style={s.saveBtnText}>Sign In / Create Account</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={[s.section, shadows.sm, { marginTop: spacing.xl, marginHorizontal: 0 }]}>
                    <Text style={[s.label, { marginBottom: spacing.sm }]}>Appearance</Text>
                    <View style={s.themeRow}>
                        {themeOptions.map(({ label, val, icon }) => (
                            <TouchableOpacity
                                key={val}
                                style={[s.themeBtn, mode === val && s.themeBtnActive]}
                                onPress={() => setMode(val)}
                            >
                                <Ionicons name={icon as any} size={18} color={mode === val ? colors.primaryContrast : colors.textSecondary} />
                                <Text style={[s.themeBtnText, mode === val && { color: colors.primaryContrast }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={s.flex} contentContainerStyle={s.content}>
            {/* Avatar */}
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.avatarBg}>
                <View style={s.avatarWrap}>
                    {user?.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={s.avatar} contentFit="cover" />
                    ) : (
                        <View style={[s.avatar, { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="person" size={36} color={colors.primary} />
                        </View>
                    )}
                </View>
                <Text style={s.avatarName}>{user?.first_name} {user?.last_name}</Text>
                <Text style={s.avatarEmail}>{user?.email}</Text>
            </LinearGradient>

            {/* Quick Links */}
            <View style={[s.section, shadows.sm]}>
                {[
                    { icon: 'receipt-outline', label: 'My Orders', screen: 'OrderHistory' },
                    { icon: 'location-outline', label: 'My Addresses', screen: 'AddressBook' },
                ].map(({ icon, label, screen }) => (
                    <TouchableOpacity key={screen} style={s.linkRow} onPress={() => navigation.navigate(screen)} activeOpacity={0.85}>
                        <View style={s.linkIconWrap}>
                            <Ionicons name={icon as any} size={20} color={colors.primary} />
                        </View>
                        <Text style={s.linkLabel}>{label}</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Edit Profile */}
            <Text style={s.sectionTitle}>Edit Profile</Text>
            <View style={[s.section, shadows.sm]}>
                <Text style={s.label}>First Name</Text>
                <TextInput style={s.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textMuted} />
                <Text style={[s.label, { marginTop: spacing.md }]}>Last Name</Text>
                <TextInput style={s.input} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textMuted} />
                <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.88}>
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.saveBtnGrad}>
                        {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Theme */}
            <Text style={s.sectionTitle}>Appearance</Text>
            <View style={[s.section, shadows.sm]}>
                <View style={s.themeRow}>
                    {themeOptions.map(({ label, val, icon }) => (
                        <TouchableOpacity
                            key={val}
                            style={[s.themeBtn, mode === val && s.themeBtnActive]}
                            onPress={() => setMode(val)}
                        >
                            <Ionicons name={icon as any} size={18} color={mode === val ? colors.primaryContrast : colors.textSecondary} />
                            <Text style={[s.themeBtnText, mode === val && { color: colors.primaryContrast }]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={[s.logoutBtn, shadows.sm]} onPress={handleLogout} activeOpacity={0.88}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[s.logoutText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: c.background },
        content: { paddingBottom: 120 },
        avatarBg: { padding: sp.xl, alignItems: 'center', paddingBottom: 30 },
        avatarWrap: { marginBottom: 12 },
        avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
        avatarName: { color: '#fff', fontSize: f.sizes.lg, fontWeight: '700' },
        avatarEmail: { color: 'rgba(255,255,255,0.8)', fontSize: f.sizes.sm, marginTop: 2 },
        section: { backgroundColor: c.card, borderRadius: r.lg, padding: sp.base, marginHorizontal: sp.base, marginBottom: sp.md },
        sectionTitle: { fontSize: f.sizes.base, fontWeight: '700', color: c.text, marginBottom: sp.sm, marginTop: sp.lg, paddingHorizontal: sp.base },
        linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: sp.sm, gap: sp.md },
        linkIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary + '22', alignItems: 'center', justifyContent: 'center' },
        linkLabel: { flex: 1, fontSize: f.sizes.base, color: c.text, fontWeight: '600' },
        label: { fontSize: f.sizes.sm, fontWeight: '600', color: c.text, marginBottom: 5 },
        input: { height: 46, backgroundColor: c.inputBg, borderRadius: r.md, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: sp.md, color: c.text, fontSize: f.sizes.base },
        saveBtn: { borderRadius: r.md, overflow: 'hidden', marginTop: sp.lg },
        saveBtnGrad: { paddingVertical: 12, alignItems: 'center' },
        saveBtnText: { color: '#fff', fontWeight: '700', fontSize: f.sizes.base },
        themeRow: { flexDirection: 'row', gap: sp.sm },
        themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: r.md, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.inputBg },
        themeBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
        themeBtnText: { fontSize: f.sizes.xs, fontWeight: '700', color: c.textSecondary },
        logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: sp.base, padding: sp.base, backgroundColor: c.card, borderRadius: r.lg },
        logoutText: { fontSize: f.sizes.base, fontWeight: '700' },
    });
