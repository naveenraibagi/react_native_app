import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, Text, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCartStore } from '../../stores/cartStore';

export default function PaymentWebViewScreen({ route, navigation }: any) {
    const { url, orderId } = route.params;
    const { colors } = useTheme();
    const { clearCart } = useCartStore();
    const webViewRef = useRef<WebView>(null);

    // Standard Mobile Chrome / Safari User-Agent (strips 'wv' so gateways treat it as native mobile browser)
    const customUserAgent = Platform.select({
        android: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        default: undefined,
    });

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

    // Intercept UPI and app deep-links (phonepe://, paytm://, gpay://, upi://, intent://)
    const handleShouldStartLoad = (request: any) => {
        const { url: reqUrl } = request;
        
        if (
            reqUrl &&
            !reqUrl.startsWith('http://') &&
            !reqUrl.startsWith('https://') &&
            !reqUrl.startsWith('about:blank')
        ) {
            Linking.openURL(reqUrl).catch((err) => {
                console.warn('Failed to open payment deep link URL:', reqUrl, err);
                Alert.alert('App Not Found', 'Could not open the requested payment app on your device.');
            });
            return false; // Prevent WebView from trying to load non-HTTP schemes internally
        }
        return true;
    };

    const handleOpenInBrowser = () => {
        Alert.alert(
            'Open in Mobile Browser',
            'Do you want to open this payment page in your default browser app?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open',
                    onPress: () => {
                        Linking.openURL(url).catch(() => {
                            Alert.alert('Error', 'Unable to open browser.');
                        });
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Secure Payment</Text>
                <TouchableOpacity onPress={handleOpenInBrowser} style={styles.browserBtn} title="Open in Browser">
                    <Ionicons name="compass-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>
            
            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                userAgent={customUserAgent}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                mixedContentMode="always"
                setSupportMultipleWindows={false}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
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
    browserBtn: {
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
