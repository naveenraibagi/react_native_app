import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    Dimensions, Clipboard, Share, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';
import { fetchProductById } from '../../services/products.service';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfferPopupProps {
    coupon: any;
    onClose: () => void;
}

export default function OfferPopup({ coupon, onClose }: OfferPopupProps) {
    const { colors, spacing, radius, fonts } = useTheme();
    const navigation = useNavigation<any>();
    const [isVisible, setIsVisible] = useState(false);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (coupon) {
            checkAndShow();
            if (coupon.product_ids && coupon.product_ids.length > 0) {
                fetchProductById(coupon.product_ids[0]).then(setProduct).catch(console.error);
            } else {
                setProduct(null);
            }
        }
    }, [coupon]);

    const checkAndShow = async () => {
        // Don't show if expired
        if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
            setIsVisible(false);
            return;
        }

        const lastShown = await AsyncStorage.getItem(`coupon_popup_${coupon.id}`);
        const now = Date.now();
        
        // Show once every 24 hours per specific coupon
        if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
            setIsVisible(true);
            await AsyncStorage.setItem(`coupon_popup_${coupon.id}`, now.toString());
        }
    };

    const copyToClipboard = () => {
        Clipboard.setString(coupon.code);
        Alert.alert('Success', 'Coupon code copied to clipboard!');
    };

    if (!coupon) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsVisible(false)}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.header}
                    >
                        <TouchableOpacity style={styles.closeBtn} onPress={() => {
                            setIsVisible(false);
                            onClose?.();
                        }}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Ionicons name="gift-outline" size={50} color="#fff" />
                        <Text style={styles.headerTitle}>Special Offer For You!</Text>
                    </LinearGradient>

                    <View style={styles.content}>
                        <Text style={[styles.amount, { color: colors.primary }]}>
                            {coupon.discount_type === 'percent' ? `${coupon.amount}% OFF` : `₹${coupon.amount} OFF`}
                        </Text>
                        
                        {product && (
                            <View style={styles.productInfo}>
                                <Image 
                                    source={{ uri: product.images?.[0]?.src }} 
                                    style={[styles.productImage, { borderRadius: radius.md }]} 
                                />
                                <View style={styles.productText}>
                                    <Text style={[styles.productLabel, { color: colors.textMuted }]}>Valid only for:</Text>
                                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>
                                </View>
                            </View>
                        )}

                        <Text style={[styles.description, { color: colors.textMuted, marginTop: product ? 15 : 0 }]}>
                            {coupon.description || (product ? `Get this special discount on ${product.name}!` : 'Use this coupon code at checkout to get an extra discount on your order.')}
                        </Text>

                        <TouchableOpacity style={styles.codeContainer} onPress={copyToClipboard} activeOpacity={0.7}>
                            <View style={styles.codeLabel}>
                                <Text style={styles.codeLabelText}>COUPON CODE</Text>
                            </View>
                            <Text style={[styles.codeText, { color: colors.text }]}>{coupon.code}</Text>
                            <Ionicons name="copy-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>

                        <View style={styles.buttonRow}>
                            {product && (
                                <TouchableOpacity
                                    style={[styles.secondaryBtn, { borderColor: colors.primary, borderRadius: radius.full, borderWidth: 1 }]}
                                    onPress={() => {
                                        setIsVisible(false);
                                        navigation.navigate('ProductDetail', { productId: product.id });
                                    }}
                                >
                                    <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>View Item</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.applyBtn, { 
                                    backgroundColor: colors.primary, 
                                    borderRadius: radius.full,
                                    flex: product ? 1.5 : 1,
                                    marginLeft: product ? 10 : 0
                                }]}
                                onPress={() => {
                                    copyToClipboard();
                                    setIsVisible(false);
                                    onClose?.();
                                }}
                            >
                                <Text style={styles.applyBtnText}>{product ? 'Claim & Shop' : 'Claim Offer Now'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: '100%',
        maxWidth: 340,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    header: {
        paddingVertical: 30,
        alignItems: 'center',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        marginTop: 10,
    },
    content: {
        padding: 25,
        alignItems: 'center',
    },
    amount: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 10,
        width: '100%',
        marginBottom: 5,
        borderRadius: 12,
    },
    productImage: {
        width: 50,
        height: 50,
    },
    productText: {
        marginLeft: 12,
        flex: 1,
    },
    productLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ddd',
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    codeLabel: {
        position: 'absolute',
        top: -10,
        left: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 5,
    },
    codeLabelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#999',
    },
    codeText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
    },
    secondaryBtn: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    applyBtn: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
