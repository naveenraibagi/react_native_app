import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { resetPassword } from '../../services/auth.service';

export default function ForgotPasswordScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email address'); return; }
        setLoading(true);
        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (error: any) {
            console.error('Password reset error:', error);
            const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
            Alert.alert('Reset Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const s = st(colors, spacing, radius, fonts);
    return (
        <View style={s.flex}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Ionicons name="key-outline" size={48} color="#fff" />
                <Text style={s.headerTitle}>Forgot Password</Text>
                <Text style={s.headerSub}>We'll send a reset link to your email</Text>
            </LinearGradient>

            <View style={s.body}>
                {sent ? (
                    <View style={s.successBox}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                        <Text style={s.successTitle}>Email Sent!</Text>
                        <Text style={s.successDesc}>
                            If an account with {email} exists, you'll receive a password reset link shortly.
                        </Text>
                        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.btnGrad}>
                                <Text style={s.btnText}>Back to Sign In</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={s.label}>Email Address</Text>
                        <View style={s.inputWrap}>
                            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={s.icon} />
                            <TextInput
                                style={s.input}
                                placeholder="hello@example.com"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity style={s.btn} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
                            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.btnGrad}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Link</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: spacing.base, alignItems: 'center' },
        back: { alignSelf: 'flex-start', marginBottom: 16 },
        headerTitle: { color: '#fff', fontSize: fonts.sizes.xl, fontWeight: '800', marginTop: 8 },
        headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: fonts.sizes.sm, marginTop: 4 },
        body: { flex: 1, padding: spacing.base + 4 },
        label: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600', marginBottom: 6 },
        inputWrap: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg,
            borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
            paddingHorizontal: spacing.md, height: 50, marginBottom: spacing.lg,
        },
        icon: { marginRight: 8 },
        input: { flex: 1, color: colors.text, fontSize: fonts.sizes.base },
        btn: { borderRadius: radius.md, overflow: 'hidden' },
        btnGrad: { paddingVertical: 14, alignItems: 'center' },
        btnText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
        successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
        successTitle: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text },
        successDesc: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
    });
