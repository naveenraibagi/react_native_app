import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { loginUser } from '../../services/auth.service';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts } = useTheme();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const { token, user } = await loginUser(data.email, data.password);
            setAuth(user, token);
        } catch (e: any) {
            Alert.alert('Login Failed', e?.response?.data?.message ?? e.message ?? 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const s = styles(colors, spacing, radius, fonts);

    return (
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.header}>
                <Ionicons name="storefront" size={48} color="#fff" />
                <Text style={s.appName}>ShopMobile</Text>
                <Text style={s.subtitle}>Your premium shopping experience</Text>
            </LinearGradient>

            <ScrollView style={s.body} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
                <Text style={s.title}>Welcome Back</Text>
                <Text style={s.desc}>Sign in to continue shopping</Text>

                {/* Email */}
                <View style={s.fieldGroup}>
                    <Text style={s.label}>Email Address</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <View style={[s.inputWrap, errors.email && s.inputError]}>
                                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={s.inputIcon} />
                                <TextInput
                                    style={s.input}
                                    placeholder="hello@example.com"
                                    placeholderTextColor={colors.textMuted}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                    />
                    {errors.email && <Text style={s.errorText}>{errors.email.message}</Text>}
                </View>

                {/* Password */}
                <View style={s.fieldGroup}>
                    <Text style={s.label}>Password</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <View style={[s.inputWrap, errors.password && s.inputError]}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={s.inputIcon} />
                                <TextInput
                                    style={s.input}
                                    placeholder="Your password"
                                    placeholderTextColor={colors.textMuted}
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.password && <Text style={s.errorText}>{errors.password.message}</Text>}
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotWrap}>
                    <Text style={s.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={s.loginBtn} onPress={handleSubmit(onSubmit)} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.loginGrad}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.loginBtnText}>Sign In</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={s.divider}>
                    <View style={s.dividerLine} />
                    <Text style={s.dividerText}>or continue as</Text>
                    <View style={s.dividerLine} />
                </View>

                {/* Social – scaffold only */}
                <TouchableOpacity style={s.socialBtn} activeOpacity={0.85}>
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text style={s.socialText}>Sign in with Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.socialBtn} activeOpacity={0.85}>
                    <Ionicons name="logo-apple" size={20} color={colors.text} />
                    <Text style={s.socialText}>Sign in with Apple</Text>
                </TouchableOpacity>

                <View style={s.signupRow}>
                    <Text style={s.signupLabel}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={s.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: {
            paddingTop: 70,
            paddingBottom: 40,
            alignItems: 'center',
        },
        appName: { color: '#fff', fontSize: fonts.sizes.xxl, fontWeight: '800', marginTop: 8 },
        subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: fonts.sizes.sm, marginTop: 4 },
        body: { flex: 1 },
        bodyContent: { padding: spacing.base + 4, paddingBottom: 40 },
        title: { fontSize: fonts.sizes.xl, fontWeight: '700', color: colors.text, marginBottom: 4, marginTop: 8 },
        desc: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginBottom: spacing.lg },
        fieldGroup: { marginBottom: spacing.md },
        label: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600', marginBottom: 6 },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBg,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            height: 50,
        },
        inputError: { borderColor: colors.error },
        inputIcon: { marginRight: 8 },
        input: { flex: 1, color: colors.text, fontSize: fonts.sizes.base },
        errorText: { color: colors.error, fontSize: fonts.sizes.xs, marginTop: 4 },
        forgotWrap: { alignItems: 'flex-end', marginBottom: spacing.lg },
        forgotText: { color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '600' },
        loginBtn: { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
        loginGrad: { paddingVertical: 14, alignItems: 'center' },
        loginBtnText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
        divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.base },
        dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
        dividerText: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginHorizontal: 10 },
        socialBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: radius.md,
            height: 48,
            gap: 10,
            marginBottom: spacing.md,
        },
        socialText: { color: colors.text, fontSize: fonts.sizes.base, fontWeight: '600' },
        signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
        signupLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
        signupLink: { color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '700' },
    });
