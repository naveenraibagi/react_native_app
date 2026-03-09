import React, { useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

const schema = z.object({
    first_name: z.string().min(1, 'Required'),
    last_name: z.string().min(1, 'Required'),
    email: z.string().email('Enter a valid email'),
    address_1: z.string().min(3, 'Required'),
    address_2: z.string().optional(),
    city: z.string().min(1, 'Required'),
    state: z.string().min(1, 'Required'),
    postcode: z.string().min(6, 'Must be 6 digits').max(6, 'Must be 6 digits'),
    country: z.string().min(2, 'Required'),
    phone: z.string().min(10, 'Phone is mandatory (min 10 digits)'),
});
type FormData = z.infer<typeof schema>;

export default function AddressFormScreen({ route, navigation }: any) {
    const { type, address, onSave: onSaveCallback } = route.params ?? {};
    const { colors, spacing, radius, fonts } = useTheme();

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            country: 'IN',
            ...address
        },
    });

    const onSave = (data: FormData) => {
        if (onSaveCallback) {
            onSaveCallback(data);
        }
        navigation.goBack();
    };

    const s = st(colors, spacing, radius, fonts);

    const Field = ({ name, label, placeholder, keyboard = 'default', loading = false }: any) => (
        <View style={s.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={s.label}>{label}</Text>
                {loading && <ActivityIndicator size="small" color={colors.primary} />}
            </View>
            <Controller control={control} name={name} render={({ field: { onChange, value } }) => (
                <TextInput
                    style={[s.input, (errors as any)[name] && s.inputErr]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value ?? ''}
                    onChangeText={onChange}
                    keyboardType={keyboard}
                />
            )} />
            {(errors as any)[name] && <Text style={s.err}>{(errors as any)[name].message}</Text>}
        </View>
    );

    return (
        <ScrollView style={s.flex} contentContainerStyle={s.content}>
            <Text style={s.heading}>{type === 'billing' ? 'Billing' : 'Shipping'} Address</Text>
            <View style={s.row}>
                <View style={s.half}><Field name="first_name" label="First Name" placeholder="John" /></View>
                <View style={s.half}><Field name="last_name" label="Last Name" placeholder="Doe" /></View>
            </View>
            <Field name="email" label="Email Address" placeholder="john@example.com" keyboard="email-address" />
            <Field name="address_1" label="Address Line 1" placeholder="123 Main St" />
            <Field name="address_2" label="Address Line 2 (optional)" placeholder="Apt, Suite, etc." />
            <View style={s.row}>
                <View style={s.half}><Field name="country" label="Country" placeholder="IN" /></View>
                <View style={s.half}><Field name="postcode" label="ZIP / Postcode" placeholder="100001" keyboard="numeric" /></View>
            </View>
            <View style={s.row}>
                <View style={s.half}><Field name="city" label="City" placeholder="Mumbai" /></View>
                <View style={s.half}><Field name="state" label="State" placeholder="Maharashtra" /></View>
            </View>
            <Field name="phone" label="Phone" placeholder="9876543210" keyboard="phone-pad" />

            <TouchableOpacity style={s.btn} onPress={handleSubmit(onSave)} activeOpacity={0.88}>
                <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.btnGrad}>
                    <Text style={s.btnText}>Save Address</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: c.background },
        content: { padding: sp.base, paddingBottom: 60 },
        heading: { fontSize: f.sizes.lg, fontWeight: '700', color: c.text, marginBottom: sp.lg },
        row: { flexDirection: 'row', gap: sp.base },
        half: { flex: 1 },
        field: { marginBottom: sp.md },
        label: { fontSize: f.sizes.sm, fontWeight: '600', color: c.text, marginBottom: 5 },
        input: { height: 46, backgroundColor: c.inputBg, borderRadius: r.md, borderWidth: 1.5, borderColor: c.border, paddingHorizontal: sp.md, color: c.text, fontSize: f.sizes.base },
        inputErr: { borderColor: c.error },
        err: { color: c.error, fontSize: f.sizes.xs, marginTop: 3 },
        btn: { borderRadius: r.md, overflow: 'hidden', marginTop: sp.lg },
        btnGrad: { paddingVertical: 14, alignItems: 'center' },
        btnText: { color: '#fff', fontWeight: '700', fontSize: f.sizes.base },
    });

