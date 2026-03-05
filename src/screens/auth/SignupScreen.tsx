import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { registerUser } from '../../services/auth.service';

const schema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function SignupScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts } = useTheme();
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await registerUser(data.email, data.password, data.firstName, data.lastName);
            Alert.alert('Account Created!', 'Please sign in with your new account.', [
                { text: 'Sign In', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (e: any) {
            Alert.alert('Signup Failed', e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    };

    const s = st(colors, spacing, radius, fonts);

    const Field = ({ name, label, placeholder, icon, keyboard = 'default', secure = false }: any) => (
        <View style={s.fieldGroup}>
            <Text style={s.label}>{label}</Text>
            <Controller control={control} name={name} render={({ field: { onChange, value } }) => (
                <View style={[s.inputWrap, (errors as any)[name] && s.inputError]}>
                    <Ionicons name={icon} size={18} color={colors.textSecondary} style={s.inputIcon} />
                    <TextInput
                        style={s.input}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        keyboardType={keyboard}
                        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                        secureTextEntry={secure && !showPw}
                    />
                    {secure && (
                        <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )} />
            {(errors as any)[name] && <Text style={s.errorText}>{(errors as any)[name].message}</Text>}
        </View>
    );

    return (
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Create Account</Text>
                <Text style={s.headerSub}>Start your shopping journey</Text>
            </LinearGradient>

            <ScrollView style={s.body} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
                <Field name="firstName" label="First Name" placeholder="John" icon="person-outline" />
                <Field name="lastName" label="Last Name" placeholder="Doe" icon="person-outline" />
                <Field name="email" label="Email Address" placeholder="hello@example.com" icon="mail-outline" keyboard="email-address" />
                <Field name="password" label="Password" placeholder="Min 6 characters" icon="lock-closed-outline" secure />
                <Field name="confirmPassword" label="Confirm Password" placeholder="Repeat password" icon="lock-closed-outline" secure />

                <TouchableOpacity style={s.btn} onPress={handleSubmit(onSubmit)} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.btnGrad}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={s.row}>
                    <Text style={s.rowLabel}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={s.rowLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: spacing.base },
        backBtn: { marginBottom: 12 },
        headerTitle: { color: '#fff', fontSize: fonts.sizes.xl, fontWeight: '800' },
        headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: fonts.sizes.sm, marginTop: 4 },
        body: { flex: 1 },
        bodyContent: { padding: spacing.base + 4, paddingBottom: 40 },
        fieldGroup: { marginBottom: spacing.md },
        label: { fontSize: fonts.sizes.sm, color: colors.text, fontWeight: '600', marginBottom: 6 },
        inputWrap: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg,
            borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
            paddingHorizontal: spacing.md, height: 50,
        },
        inputError: { borderColor: colors.error },
        inputIcon: { marginRight: 8 },
        input: { flex: 1, color: colors.text, fontSize: fonts.sizes.base },
        errorText: { color: colors.error, fontSize: fonts.sizes.xs, marginTop: 4 },
        btn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.base },
        btnGrad: { paddingVertical: 14, alignItems: 'center' },
        btnText: { color: '#fff', fontSize: fonts.sizes.base, fontWeight: '700' },
        row: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
        rowLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
        rowLink: { color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '700' },
    });
