import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions, StatusBar, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { activeConfig } from '../../config';

const { width } = Dimensions.get('window');

export default function SupportScreen() {
    const { colors, spacing, radius, shadows, fonts } = useTheme();

    const openWhatsApp = (num: string) => {
        const url = `whatsapp://send?phone=91${num}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(`https://wa.me/91${num}`);
            }
        });
    };

    const openCall = (num: string) => Linking.openURL(`tel:${num}`);
    const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);

    const support = activeConfig.support;

    return (
        <View style={[s.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={s.header}
            >
                <View style={s.headerContent}>
                    <Ionicons name="headset-outline" size={60} color="#fff" style={{ marginBottom: 15 }} />
                    <Text style={s.mainTitle}>24/7 Support</Text>
                    <Text style={s.mainSubtitle}>We're here to help you with any questions or issues you might have.</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={s.cardsContainer}>
                    {support?.whatsapp.map((num, idx) => (
                        <TouchableOpacity 
                            key={`wa-${idx}`}
                            style={[s.supportCard, { backgroundColor: colors.surface, ...shadows.md }]}
                            onPress={() => openWhatsApp(num)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#25D366', '#128C7E']}
                                style={s.supportIconBg}
                            >
                                <Ionicons name="logo-whatsapp" size={28} color="#fff" />
                            </LinearGradient>
                            <View style={s.cardTextContainer}>
                                <Text style={[s.supportBtnTitle, { color: colors.text }]}>WhatsApp Us</Text>
                                <Text style={[s.supportBtnValue, { color: colors.textSecondary }]}>Direct chat for quick resolution</Text>
                                <Text style={[s.phoneNum, { color: colors.primary }]}>+91 {num}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}

                    <View style={s.supportGrid}>
                        <TouchableOpacity 
                            style={[s.supportGridItem, { backgroundColor: colors.surface, ...shadows.md }]}
                            onPress={() => support?.phone[0] && openCall(support.phone[0])}
                        >
                            <View style={[s.gridIconBg, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="call" size={26} color={colors.primary} />
                            </View>
                            <Text style={[s.gridItemLabel, { color: colors.text }]}>Call Us</Text>
                            <Text style={s.gridItemSub}>Voice Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[s.supportGridItem, { backgroundColor: colors.surface, ...shadows.md }]}
                            onPress={() => support?.email && openEmail(support.email)}
                        >
                            <View style={[s.gridIconBg, { backgroundColor: '#EA433515' }]}>
                                <Ionicons name="mail" size={26} color="#EA4335" />
                            </View>
                            <Text style={[s.gridItemLabel, { color: colors.text }]}>Email Us</Text>
                            <Text style={s.gridItemSub}>Detailed Inquiry</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[s.infoBox, { backgroundColor: colors.surface, ...shadows.sm }]}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <Text style={[s.infoText, { color: colors.textSecondary }]}>
                            Our support team is available Monday to Saturday, 10 AM to 7 PM IST.
                        </Text>
                    </View>
                </View>

                <View style={s.footer}>
                    <Text style={[s.footerText, { color: colors.textMuted }]}>
                        Thank you for choosing SBDH PIXELS
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerContent: {
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 30,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    cardsContainer: {
        padding: 20,
        gap: 20,
        marginTop: 10,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 24,
    },
    supportIconBg: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    supportBtnTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    supportBtnValue: {
        fontSize: 13,
        marginTop: 2,
    },
    phoneNum: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 4,
    },
    supportGrid: {
        flexDirection: 'row',
        gap: 20,
    },
    supportGridItem: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
    },
    gridIconBg: {
        width: 52,
        height: 52,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    gridItemLabel: {
        fontSize: 16,
        fontWeight: '800',
    },
    gridItemSub: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.1)',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
