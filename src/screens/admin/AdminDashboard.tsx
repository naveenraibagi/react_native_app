import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import * as Notifications from '../../services/notification.service';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export default function AdminDashboard({ navigation }: any) {
    const { colors, spacing, radius, fonts, shadows } = useTheme();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [scheduling, setScheduling] = useState(false);

    const isAndroidExpoGo = 
        Platform.OS === 'android' && 
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    const handleSendTest = async () => {
        if (!title || !body) {
            Alert.alert('Error', 'Please enter title and body');
            return;
        }

        if (isAndroidExpoGo) {
            Alert.alert(
                'Expo Go Restriction',
                'Android Expo Go (SDK 53+) does not support push notifications. This button will work in a standalone build or on iOS.'
            );
            return;
        }

        try {
            await Notifications.scheduleTestNotification(title, body);
            Alert.alert('Success', 'Sample notification scheduled for 5 seconds from now. Lock your screen or go to home to see it!');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const s = st(colors, spacing, radius, fonts);

    return (
        <View style={s.flex}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.header}>
                <View style={s.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Admin Dashboard</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={s.content}>
                <View style={[s.card, shadows.md]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <View style={[s.iconBg, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="notifications" size={24} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={s.cardTitle}>Draft Notification</Text>
                            <Text style={s.cardSub}>Send a message to all users</Text>
                        </View>
                    </View>

                    <Text style={s.label}>Notification Title</Text>
                    <TextInput
                        style={s.input}
                        placeholder="e.g., Special Diwali Sale! 🪔"
                        placeholderTextColor={colors.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={[s.label, { marginTop: 20 }]}>Message Body</Text>
                    <TextInput
                        style={[s.input, s.textArea]}
                        placeholder="e.g., Get flat 50% off on all Thoran collections today."
                        placeholderTextColor={colors.textMuted}
                        value={body}
                        onChangeText={setBody}
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity 
                        style={s.mainBtn} 
                        onPress={() => Alert.alert('Production Feature', 'Sending to all 10k users requires Firebase Cloud Functions integration.')}
                    >
                        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={s.btnGrad}>
                            <Ionicons name="paper-plane" size={20} color="#fff" />
                            <Text style={s.btnText}>Send to All Users (Production)</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.testBtn, { marginTop: 15 }]} 
                        onPress={handleSendTest}
                    >
                        <Ionicons name="flask-outline" size={20} color={colors.primary} />
                        <Text style={[s.testBtnText, { color: colors.primary }]}>Send Sample to My Phone (5s Test)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[s.subBtn, { marginTop: 15 }]}
                        onPress={() => Alert.alert('Scheduler', 'Backend integration required for global scheduling.')}
                    >
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                        <Text style={[s.subBtnText, { color: colors.textSecondary }]}>Schedule for Later</Text>
                    </TouchableOpacity>
                </View>

                {isAndroidExpoGo && (
                    <View style={[s.warningCard, { marginTop: 20 }]}>
                        <Ionicons name="warning-outline" size={20} color="#FF9500" />
                        <Text style={s.warningText}>
                            Note: Android Expo Go SDK 53 does not support local/push notifications. Build an APK to test.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const st = (c: any, sp: any, r: any, f: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: c.background },
        header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: sp.base },
        headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sp.base },
        headerTitle: { color: '#fff', fontSize: f.sizes.lg, fontWeight: '700' },
        backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
        content: { padding: sp.base },
        card: { backgroundColor: c.card, borderRadius: r.xl, padding: 20, marginTop: 10 },
        cardTitle: { fontSize: f.sizes.lg, fontWeight: '700', color: c.text },
        cardSub: { fontSize: f.sizes.sm, color: c.textSecondary, marginTop: 2 },
        iconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
        label: { fontSize: f.sizes.sm, fontWeight: '600', color: c.text, marginBottom: 8 },
        input: { backgroundColor: c.inputBg, borderRadius: r.md, borderWidth: 1.5, borderColor: c.border, padding: 12, color: c.text, fontSize: f.sizes.base },
        textArea: { height: 100, textAlignVertical: 'top' },
        mainBtn: { borderRadius: r.md, overflow: 'hidden', marginTop: 20 },
        btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
        btnText: { color: '#fff', fontSize: f.sizes.base, fontWeight: '700' },
        testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: r.md, borderWidth: 1.5, borderColor: c.primary, backgroundColor: c.primary + '08' },
        testBtnText: { fontSize: f.sizes.base, fontWeight: '700' },
        subBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: r.md, borderWidth: 1.5, borderColor: c.border },
        subBtnText: { fontSize: f.sizes.base, fontWeight: '600' },
        warningCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FF950015', padding: 15, borderRadius: r.md, borderWidth: 1, borderColor: '#FF950033' },
        warningText: { color: '#FF9500', fontSize: f.sizes.xs, flex: 1, lineHeight: 18 }
    });
