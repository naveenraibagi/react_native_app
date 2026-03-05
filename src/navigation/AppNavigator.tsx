import React, { createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

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

// ─── Account ───────────────────────────────────────────────
import ProfileScreen from '../screens/account/ProfileScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import AddressBookScreen from '../screens/account/AddressBookScreen';

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
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="CategoryList" component={CategoryListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Categories' })} />
            <HomeStack.Screen name="ProductList" component={ProductListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Products' })} />
            <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
        </HomeStack.Navigator>
    );
};

// ─── Search Stack ──────────────────────────────────────────
const SearchStack = createNativeStackNavigator();
const SearchNavigator = () => {
    const { colors } = useTheme();
    return (
        <SearchStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <SearchStack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
            <SearchStack.Screen name="ProductList" component={ProductListScreen} options={({ route }: any) => ({ title: route.params?.title ?? 'Results' })} />
            <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
        </SearchStack.Navigator>
    );
};

// ─── Wishlist Stack ────────────────────────────────────────
const WishlistStack = createNativeStackNavigator();
const WishlistNavigator = () => {
    const { colors } = useTheme();
    return (
        <WishlistStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <WishlistStack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'My Wishlist' }} />
            <WishlistStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
        </WishlistStack.Navigator>
    );
};

// ─── Cart Stack ────────────────────────────────────────────
const CartStack = createNativeStackNavigator();
const CartNavigator = () => {
    const { colors } = useTheme();
    return (
        <CartStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
            <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <CartStack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Address' }} />
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
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <AccountStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Account' }} />
            <AccountStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
            <AccountStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
            <AccountStack.Screen name="AddressBook" component={AddressBookScreen} options={{ title: 'My Addresses' }} />
            <AccountStack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Edit Address' }} />
        </AccountStack.Navigator>
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

const AppTabs = () => {
    const { colors } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.border,
                    height: 64,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarIcon: ({ color, size, focused }) => {
                    const icons: Record<string, string> = {
                        HomeTab: focused ? 'home' : 'home-outline',
                        SearchTab: focused ? 'search' : 'search-outline',
                        WishlistTab: focused ? 'heart' : 'heart-outline',
                        CartTab: focused ? 'cart' : 'cart-outline',
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
            <Tab.Screen name="SearchTab" component={SearchNavigator} options={{ tabBarLabel: 'Search' }} />
            <Tab.Screen name="WishlistTab" component={WishlistNavigator} options={{ tabBarLabel: 'Wishlist' }} />
            <Tab.Screen name="CartTab" component={CartNavigator} options={{ tabBarLabel: 'Cart' }} />
            <Tab.Screen name="AccountTab" component={AccountNavigator} options={{ tabBarLabel: 'Account' }} />
        </Tab.Navigator>
    );
};

// ─── Root Navigator ────────────────────────────────────────
const Root = createNativeStackNavigator();
const RootNavigator = () => {
    const { isLoggedIn } = useAuthStore();
    return (
        <Root.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                <Root.Screen name="App" component={AppTabs} />
            ) : (
                <Root.Screen name="Auth" component={AuthNavigator} />
            )}
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
