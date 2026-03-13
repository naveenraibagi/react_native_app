import axios from 'axios';
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
        // 1. Get product details to find the permalink
        console.log('Fetching product permalink for ID:', productId);
        const { data: product } = await wooApi.get(`/products/${productId}`);
        const permalink = product.permalink;

        if (!permalink) {
            console.warn('No permalink found for product');
            return [];
        }

        // 2. Fetch the HTML content of the product page
        console.log('Fetching product HTML from:', permalink);
        // We use axios directly since wooApi/wpApi have /wp-json prefix
        const { data: html } = await axios.get(permalink);

        // 3. Extract ppom_input_vars using regex
        // The script usually looks like: var ppom_input_vars = {"ppom_inputs": [...], ...};
        const regex = /var\s+ppom_input_vars\s*=\s*({[\s\S]*?});/m;
        const match = html.match(regex);

        if (match && match[1]) {
            try {
                const config = JSON.parse(match[1]);
                if (config.ppom_inputs && Array.isArray(config.ppom_inputs)) {
                    console.log(`Successfully scraped ${config.ppom_inputs.length} PPOM fields from HTML`);
                    return config.ppom_inputs;
                }
            } catch (parseError) {
                console.warn('Failed to parse scraped PPOM JSON:', parseError);
            }
        }

        console.warn('PPOM configuration not found in page HTML');
    } catch (error: any) {
        console.warn('PPOM HTML scraping failed:', error.message);
    }

    return [];
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
