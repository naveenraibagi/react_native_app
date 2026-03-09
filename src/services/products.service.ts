import { wooApi, wpApi, WC_CONFIG } from '../config/api';
import { WCProduct, ProductFilters } from '../types';

// ─── Products ─────────────────────────────────────────────
export const fetchProducts = async (filters: ProductFilters = {}): Promise<WCProduct[]> => {
    const params: Record<string, any> = {
        per_page: filters.perPage ?? 20,
        page: filters.page ?? 1,
        status: 'publish',
    };
    if (filters.categoryId) params.category = filters.categoryId;
    if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
    if (filters.minRating !== undefined) params.rating = filters.minRating;
    if (filters.onSale) params.on_sale = true;
    if (filters.inStock) params.stock_status = 'instock';
    if (filters.search) params.search = filters.search;
    if (filters.sort) {
        switch (filters.sort) {
            case 'price': params.orderby = 'price'; params.order = 'asc'; break;
            case 'price-desc': params.orderby = 'price'; params.order = 'desc'; break;
            case 'date': params.orderby = 'date'; params.order = 'desc'; break;
            case 'rating': params.orderby = 'rating'; break;
            case 'popularity': params.orderby = 'popularity'; break;
            default: params.orderby = 'menu_order';
        }
    }
    const { data } = await wooApi.get('/products', { params });
    return data;
};

export const fetchProductById = async (id: number): Promise<WCProduct> => {
    const { data } = await wooApi.get(`/products/${id}`);
    return data;
};

export const fetchProductPPOMFields = async (productId: number) => {
    try {
        const url = `/custom/v1/ppom-fields/${productId}`;
        console.log('Fetching PPOM fields from:', url);
        const { data } = await wpApi.get(url);
        console.log('PPOM API Response:', data);
        if (data.status === 'success' && data.ppom_fields) {
            return data.ppom_fields;
        }
        return [];
    } catch (error: any) {
        console.warn('Error fetching PPOM fields:', error?.message || error);
        return [];
    }
};

export const fetchProductVariations = async (productId: number) => {
    const { data } = await wooApi.get(`/products/${productId}/variations`);
    return data;
};

export const fetchProductReviews = async (productId: number) => {
    const { data } = await wooApi.get('/products/reviews', { params: { product: productId } });
    return data;
};

export const createProductReview = async (
    productId: number,
    reviewer: string,
    email: string,
    review: string,
    rating: number
) => {
    const { data } = await wooApi.post('/products/reviews', {
        product_id: productId,
        reviewer,
        reviewer_email: email,
        review,
        rating,
    });
    return data;
};

// ─── Categories ────────────────────────────────────────────
export const fetchCategories = async (parentId?: number) => {
    const params: Record<string, any> = { per_page: 100, hide_empty: true };
    if (parentId !== undefined) params.parent = parentId;
    const { data } = await wooApi.get('/products/categories', { params });
    return data;
};

// ─── Search suggestions (simple) ──────────────────────────
export const searchProductNames = async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    const { data } = await wooApi.get('/products', {
        params: { search: query, per_page: 8, status: 'publish', _fields: 'id,name' },
    });
    return data.map((p: any) => p.name);
};
