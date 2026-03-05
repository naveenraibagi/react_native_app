// ────────────────────────────────────────────────────────────
// Core WooCommerce Types
// ────────────────────────────────────────────────────────────

export interface WCImage {
    id: number;
    src: string;
    name: string;
    alt: string;
}

export interface WCCategory {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    display: string;
    image: WCImage | null;
    menu_order: number;
    count: number;
}

export interface WCPrice {
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    currency_symbol?: string;
}

export interface WCProductAttribute {
    id: number;
    name: string;
    options: string[];
    variation: boolean;
    visible: boolean;
}

export interface WCVariation {
    id: number;
    price: string;
    regular_price: string;
    sale_price: string;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    stock_quantity: number | null;
    attributes: { id: number; name: string; option: string }[];
    image: WCImage | null;
}

export interface WCRating {
    average: string;
    count: number;
}

export interface WCProduct {
    id: number;
    name: string;
    slug: string;
    type: 'simple' | 'variable' | 'grouped' | 'external';
    status: string;
    featured: boolean;
    short_description: string;
    description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    stock_quantity: number | null;
    rating_count: number;
    average_rating: string;
    categories: { id: number; name: string; slug: string }[];
    images: WCImage[];
    attributes: WCProductAttribute[];
    variations: number[];
    related_ids: number[];
    upsell_ids: number[];
    cross_sell_ids: number[];
    tags: { id: number; name: string; slug: string }[];
    weight: string;
    dimensions: { length: string; width: string; height: string };
    manage_stock: boolean;
    date_created: string;
    date_modified: string;
}

export interface WCReview {
    id: number;
    date_created: string;
    review: string;
    rating: number;
    reviewer: string;
    reviewer_email: string;
    reviewer_avatar_urls: Record<string, string>;
    verified: boolean;
}

// ────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────
export interface CartItem {
    product: WCProduct;
    variationId?: number;
    selectedAttributes?: Record<string, string>;
    quantity: number;
    price: number;
    lineTotal: number;
}

export interface CouponLine {
    code: string;
    discount: string;
    discount_tax: string;
}

// ────────────────────────────────────────────────────────────
// Address / Checkout
// ────────────────────────────────────────────────────────────
export interface WCAddress {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
}

export interface ShippingMethod {
    id: string;
    method_id: string;
    method_title: string;
    total: string;
}

// ────────────────────────────────────────────────────────────
// Order
// ────────────────────────────────────────────────────────────
export interface WCOrderLineItem {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    sku: string;
    price: number;
    total: string;
    image: WCImage;
}

export interface WCOrder {
    id: number;
    number: string;
    status:
    | 'pending'
    | 'processing'
    | 'on-hold'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'failed';
    date_created: string;
    date_modified: string;
    total: string;
    subtotal: string;
    total_tax: string;
    shipping_total: string;
    discount_total: string;
    currency: string;
    currency_symbol: string;
    billing: WCAddress;
    shipping: WCAddress;
    line_items: WCOrderLineItem[];
    shipping_lines: { method_title: string; total: string }[];
    coupon_lines: CouponLine[];
    payment_method: string;
    payment_method_title: string;
    customer_note: string;
}

// ────────────────────────────────────────────────────────────
// User / Auth
// ────────────────────────────────────────────────────────────
export interface WCUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    avatar_url: string;
    billing: WCAddress;
    shipping: WCAddress;
}

export interface AuthState {
    user: WCUser | null;
    token: string | null;
    isLoggedIn: boolean;
}

// ────────────────────────────────────────────────────────────
// Filters / Sort
// ────────────────────────────────────────────────────────────
export type SortOption =
    | 'menu_order'
    | 'popularity'
    | 'rating'
    | 'date'
    | 'price'
    | 'price-desc';

export interface ProductFilters {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    onSale?: boolean;
    inStock?: boolean;
    search?: string;
    sort?: SortOption;
    page?: number;
    perPage?: number;
}

// ────────────────────────────────────────────────────────────
// Navigation
// ────────────────────────────────────────────────────────────
export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
};

export type HomeStackParamList = {
    Home: undefined;
    CategoryList: { parentId?: number; title?: string };
    ProductList: { categoryId?: number; title?: string; search?: string };
    ProductDetail: { productId: number };
};

export type SearchStackParamList = {
    Search: undefined;
    ProductList: { categoryId?: number; title?: string; search?: string };
    ProductDetail: { productId: number };
};

export type WishlistStackParamList = {
    Wishlist: undefined;
    ProductDetail: { productId: number };
};

export type CartStackParamList = {
    Cart: undefined;
    Checkout: undefined;
    AddressForm: { type: 'billing' | 'shipping'; address?: WCAddress };
    ShippingMethod: undefined;
    Payment: { total: string };
    OrderConfirmation: { orderId: number };
};

export type AccountStackParamList = {
    Profile: undefined;
    OrderHistory: undefined;
    OrderDetail: { orderId: number };
    AddressBook: undefined;
    AddressForm: { type: 'billing' | 'shipping'; address?: WCAddress };
};

export type AppTabParamList = {
    HomeTab: undefined;
    SearchTab: undefined;
    WishlistTab: undefined;
    CartTab: undefined;
    AccountTab: undefined;
};
