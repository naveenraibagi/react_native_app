import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    FlatList, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../services/products.service';
import { WCProduct } from '../../types';
import { useNavigation } from '@react-navigation/native';

const { width: W, height: H } = Dimensions.get('window');

interface TrendingProductsAlertProps {
    visible: boolean;
    onClose: () => void;
}

export default function TrendingProductsAlert({ visible, onClose }: TrendingProductsAlertProps) {
    const { colors, spacing, radius, fonts } = useTheme();
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<WCProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadTrendingProducts();
        }
    }, [visible]);

    const loadTrendingProducts = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts({ sort: 'popularity', perPage: 5 });
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch trending products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: WCProduct }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => {
                onClose();
                navigation.navigate('ProductDetail', { productId: item.id });
            }}
        >
            <Image
                source={{ uri: item.images?.[0]?.src }}
                style={[styles.image, { borderRadius: radius.md }]}
                contentFit="cover"
            />
            <View style={styles.itemInfo}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.price, { color: colors.primary }]}>₹{item.price}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.header}
                    >
                        <View style={styles.headerTitleContainer}>
                            <Ionicons name="flame" size={24} color="#FFD700" style={{ marginRight: 8 }} />
                            <Text style={styles.headerTitle}>Trending Today</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.content}>
                        {loading ? (
                            <View style={styles.loader}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching top picks...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={products}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.list}
                                ListEmptyComponent={
                                    <View style={styles.empty}>
                                        <Text style={{ color: colors.textSecondary }}>No trending items found</Text>
                                    </View>
                                }
                            />
                        )}
                        <TouchableOpacity
                            style={[styles.footerBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}
                            onPress={onClose}
                        >
                            <Text style={styles.footerBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxHeight: H * 0.7,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    loader: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
    },
    list: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    price: {
        fontSize: 13,
        fontWeight: '700',
    },
    footerBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    footerBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    empty: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});
