import React, { createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

// ─── Auth Screens ──────────────────────────────────────────
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// ─── Home Screens ──────────────────────────────────────────
import HomeScreen from '../screens/home/HomeScreen';

// ─── Product Screens ───────────────────────────────────────
import CategoryListScreen from '../screens/products/CategoryListScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';

// ─── Search ────────────────────────────────────────────────
import SearchScreen from '../screens/search/SearchScreen';

// ─── Wishlist ──────────────────────────────────────────────
import WishlistScreen from '../screens/wishlist/WishlistScreen';

// ─── Cart & Checkout ───────────────────────────────────────
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import AddressFormScreen from '../screens/checkout/AddressFormScreen';
import OrderConfirmationScreen from '../screens/checkout/OrderConfirmationScreen';
import PaymentWebViewScreen from '../screens/checkout/PaymentWebViewScreen';

// ─── Account ───────────────────────────────────────────────
import ProfileScreen from '../screens/account/ProfileScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import AddressBookScreen from '../screens/account/AddressBookScreen';

// ─── Reels & Support ─────────────────────────────────────────
import ReelsScreen from '../screens/reels/ReelsScreen';
import SupportScreen from '../screens/support/SupportScreen';

const AuthStack = createNativeStackNavigator();
const AuthNavigator = () => {
    const { colors } = useTheme();
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Signup" component={SignupScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
};

// ─── Home Stack ────────────────────────────────────────────
const HomeStack = createNativeStackNavigator();
const HomeNavigator = () => {
    const { colors } = useTheme();
    return (
        <HomeStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderWishlistButton navigation={navigation} />
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="CategoryList" component={CategoryListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Categories' })} />
            <HomeStack.Screen name="ProductList" component={ProductListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Products' })} />
            <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    );
};

// ─── Search Stack ──────────────────────────────────────────
const SearchStack = createNativeStackNavigator();
const SearchNavigator = () => {
    const { colors } = useTheme();
    return (
        <SearchStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderWishlistButton navigation={navigation} />
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <SearchStack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <SearchStack.Screen name="ProductList" component={ProductListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Results' })} />
            <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        </SearchStack.Navigator>
    );
};


// ─── Shop Stack ────────────────────────────────────────────
const ShopStack = createNativeStackNavigator();
const ShopNavigator = () => {
    const { colors } = useTheme();
    return (
        <ShopStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderWishlistButton navigation={navigation} />
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <ShopStack.Screen name="Shop" component={ProductListScreen} options={{ title: 'Shop All' }} />
            <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        </ShopStack.Navigator>
    );
};


// ─── Wishlist Stack ─────────────────────────────────────────
const WishlistStack = createNativeStackNavigator();
const WishlistNavigator = () => {
    const { colors } = useTheme();
    return (
        <WishlistStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <WishlistStack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'My Wishlist' }} />
            <WishlistStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        </WishlistStack.Navigator>
    );
};


// ─── Cart Stack ────────────────────────────────────────────
const CartStack = createNativeStackNavigator();
const CartNavigator = () => {
    const { colors } = useTheme();
    return (
        <CartStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderWishlistButton navigation={navigation} />
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart', headerRight: () => null }} />
            <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <CartStack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Address' }} />
            <CartStack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{ headerShown: false }} />
            <CartStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ headerShown: false }} />
        </CartStack.Navigator>
    );
};

// ─── Account Stack ─────────────────────────────────────────
const AccountStack = createNativeStackNavigator();
const AccountNavigator = () => {
    const { colors } = useTheme();
    return (
        <AccountStack.Navigator
            screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <HeaderWishlistButton navigation={navigation} />
                        <HeaderCartButton navigation={navigation} />
                    </View>
                ),
            })}
        >
            <AccountStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Account' }} />
            <AccountStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
            <AccountStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
            <AccountStack.Screen name="AddressBook" component={AddressBookScreen} options={{ title: 'My Addresses' }} />
            <AccountStack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Edit Address' }} />
        </AccountStack.Navigator>
    );
};

// ─── Reels Stack ────────────────────────────────────────────
const ReelsStack = createNativeStackNavigator();
const ReelsNavigator = () => {
    return (
        <ReelsStack.Navigator screenOptions={{ headerShown: false }}>
            <ReelsStack.Screen name="Reels" component={ReelsScreen} />
        </ReelsStack.Navigator>
    );
};

// ─── Support Stack ──────────────────────────────────────────
const SupportStack = createNativeStackNavigator();
const SupportNavigator = () => {
    return (
        <SupportStack.Navigator screenOptions={{ headerShown: false }}>
            <SupportStack.Screen name="Support" component={SupportScreen} />
        </SupportStack.Navigator>
    );
};

// ─── Bottom Tabs ───────────────────────────────────────────
const Tab = createBottomTabNavigator();
const CartTabBadge = () => {
    const count = useCartStore((s) => s.itemCount());
    const { colors } = useTheme();
    if (!count) return null;
    return (
        <View style={[styles.badge, { backgroundColor: colors.badge }]}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
        </View>
    );
};

const HeaderWishlistButton = ({ navigation }: any) => {
    const count = useWishlistStore((s) => s.ids.length);
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={{ marginRight: 10, padding: 4 }}
            onPress={() => navigation.navigate('WishlistTab')}
        >
            <Ionicons name="heart-outline" size={24} color={colors.text} />
            {count > 0 && (
                <View style={[styles.badge, { backgroundColor: '#FF4781', top: 0, right: 0 }]}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const HeaderCartButton = ({ navigation }: any) => {
    const count = useCartStore((s) => s.itemCount());
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={{ marginRight: 15, padding: 4 }}
            onPress={() => navigation.navigate('CartTab')}
        >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {count > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.badge, top: 0, right: 0 }]}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const AppTabs = () => {
    const { colors, shadows } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 30 : 20,
                    left: 20,
                    right: 20,
                    backgroundColor: colors.surface,
                    borderRadius: 30,
                    height: 64,
                    borderTopWidth: 0,
                    ...shadows.md,
                    elevation: 8,
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarIcon: ({ color, size, focused }) => {
                    const icons: Record<string, string> = {
                        HomeTab: focused ? 'home' : 'home-outline',
                        ShopTab: focused ? 'bag-handle' : 'bag-handle-outline',
                        SocialTab: focused ? 'share-social' : 'share-social-outline',
                        SupportTab: focused ? 'headset' : 'headset-outline',
                        AccountTab: focused ? 'person' : 'person-outline',
                    };
                    return (
                        <View>
                            <Ionicons name={icons[route.name] as any} size={size} color={color} />
                            {route.name === 'CartTab' && <CartTabBadge />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="ShopTab" component={ShopNavigator} options={{ tabBarLabel: 'Shop' }} />
            <Tab.Screen name="SocialTab" component={ReelsNavigator} options={{ tabBarLabel: 'Social' }} />
            <Tab.Screen name="SupportTab" component={SupportNavigator} options={{ tabBarLabel: 'Support' }} />
            <Tab.Screen name="AccountTab" component={AccountNavigator} options={{ tabBarLabel: 'Account' }} />
        </Tab.Navigator>
    );
};

// ─── Root Navigator ────────────────────────────────────────
const Root = createNativeStackNavigator();
const RootNavigator = () => {
    return (
        <Root.Navigator screenOptions={{ headerShown: false }}>
            <Root.Screen name="App" component={AppTabs} />
            <Root.Screen name="Auth" component={AuthNavigator} />
            <Root.Screen name="SearchTab" component={SearchNavigator} />
            <Root.Screen name="CartTab" component={CartNavigator} />
            <Root.Screen name="WishlistTab" component={WishlistNavigator} />
        </Root.Navigator>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
});

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
}
