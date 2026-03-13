import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions, StatusBar, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { activeConfig } from '../../config';

const { width } = Dimensions.get('window');

export default function ReelsScreen() {
    const { colors, spacing, radius, shadows, fonts } = useTheme();

    const openLink = (url?: string) => {
        if (url) Linking.openURL(url);
    };

    const instagramUrl = `https://www.instagram.com/${activeConfig.instagramHandle}`;
    const youtubeUrl = activeConfig.youtubeUrl;

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

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[colors.background, colors.surface]} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={s.headerGradient}
                >
                    <View style={s.headerContent}>
                        <Text style={s.mainTitle}>Social Hub</Text>
                        <Text style={s.mainSubtitle}>Connect with us and explore our creative world across all platforms.</Text>
                    </View>
                </LinearGradient>

                <View style={s.cardsContainer}>
                    {/* Instagram Section */}
                    <TouchableOpacity 
                        style={[s.platformCard, { backgroundColor: colors.surface, ...shadows.md }]}
                        onPress={() => openLink(instagramUrl)}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#833ab4', '#fd1d1d', '#fcb045']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.cardIconBg}
                        >
                            <Ionicons name="logo-instagram" size={32} color="#fff" />
                        </LinearGradient>
                        <View style={s.cardTextContainer}>
                            <Text style={[s.platformTitle, { color: colors.text }]}>Instagram</Text>
                            <Text style={[s.platformHandle, { color: colors.primary }]}>@{activeConfig.instagramHandle}</Text>
                            <Text style={[s.platformDesc, { color: colors.textSecondary }]}>Trending nail art, quick tips, and daily updates.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* YouTube Section */}
                    {youtubeUrl && (
                        <TouchableOpacity 
                            style={[s.platformCard, { backgroundColor: colors.surface, ...shadows.md }]}
                            onPress={() => openLink(youtubeUrl)}
                            activeOpacity={0.9}
                        >
                            <View style={[s.cardIconBg, { backgroundColor: '#FF0000' }]}>
                                <Ionicons name="logo-youtube" size={32} color="#fff" />
                            </View>
                            <View style={s.cardTextContainer}>
                                <Text style={[s.platformTitle, { color: colors.text }]}>YouTube Channel</Text>
                                <Text style={[s.platformHandle, { color: '#FF0000' }]}>SBDH PIXELS</Text>
                                <Text style={[s.platformDesc, { color: colors.textSecondary }]}>In-depth tutorials, long-form videos, and more.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}

                    {/* Facebook Section */}
                    {activeConfig.facebookUrl && (
                        <TouchableOpacity 
                            style={[s.platformCard, { backgroundColor: colors.surface, ...shadows.md }]}
                            onPress={() => openLink(activeConfig.facebookUrl)}
                            activeOpacity={0.9}
                        >
                            <View style={[s.cardIconBg, { backgroundColor: '#1877F2' }]}>
                                <Ionicons name="logo-facebook" size={32} color="#fff" />
                            </View>
                            <View style={s.cardTextContainer}>
                                <Text style={[s.platformTitle, { color: colors.text }]}>Facebook Page</Text>
                                <Text style={[s.platformHandle, { color: '#1877F2' }]}>SBDH PIXELS</Text>
                                <Text style={[s.platformDesc, { color: colors.textSecondary }]}>Connect with our community and stay updated.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}

                    </View>

                <View style={s.footer}>
                    <Text style={[s.footerText, { color: colors.textMuted }]}>
                        Don't forget to tag us in your creations!
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
    scrollContent: {
        paddingBottom: 40,
    },
    headerGradient: {
        paddingTop: 70,
        paddingBottom: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            android: { elevation: 8 }
        })
    },
    headerContent: {
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    mainSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    cardsContainer: {
        padding: 20,
        marginTop: 20,
        gap: 20,
    },
    platformCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    cardIconBg: {
        width: 60,
        height: 60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    platformTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    platformHandle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    platformDesc: {
        fontSize: 12,
        lineHeight: 16,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 14,
        fontStyle: 'italic',
    }
});
