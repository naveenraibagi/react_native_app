import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';

export default function PaymentWebViewScreen({ route, navigation }: any) {
    const { url, orderId } = route.params;
    const { colors, spacing, fonts } = useTheme();
    const { clearCart } = useCartStore();
    const webViewRef = useRef<WebView>(null);

    const handleNavigationStateChange = (navState: any) => {
        const { url: currentUrl } = navState;

        // WooCommerce success redirect usually contains 'order-received' or 'checkout/thank-you'
        if (currentUrl.includes('order-received') || currentUrl.includes('checkout/thank-you')) {
            clearCart();
            setTimeout(() => {
                navigation.replace('OrderConfirmation', { orderId });
            }, 1500);
        }

        // Handle possible cancellation or failure redirects if known
        if (currentUrl.includes('cancel') || currentUrl.includes('checkout/error')) {
            Alert.alert('Payment Cancelled', 'Your payment was not completed. Please try again.');
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Secure Payment</Text>
                <View style={{ width: 40 }} />
            </View>
            
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
                onError={() => {
                    Alert.alert('Error', 'Failed to load payment page.');
                    navigation.goBack();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        padding: 5,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    loading: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
