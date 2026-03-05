import { wooApi } from '../config/api';
import { WCOrder, WCAddress } from '../types';
import { CartItem } from '../types';

export interface CreateOrderPayload {
    customerId: number;
    billing: WCAddress;
    shipping: WCAddress;
    lineItems: CartItem[];
    shippingMethodId: string;
    shippingMethodTitle: string;
    shippingTotal: string;
    couponCode?: string;
    paymentMethod: string;
    paymentMethodTitle: string;
    customerNote?: string;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<WCOrder> => {
    const body = {
        customer_id: payload.customerId,
        payment_method: payload.paymentMethod,
        payment_method_title: payload.paymentMethodTitle,
        set_paid: false,
        billing: payload.billing,
        shipping: payload.shipping,
        line_items: payload.lineItems.map((item) => ({
            product_id: item.product.id,
            variation_id: item.variationId ?? 0,
            quantity: item.quantity,
        })),
        shipping_lines: [
            {
                method_id: payload.shippingMethodId,
                method_title: payload.shippingMethodTitle,
                total: payload.shippingTotal,
            },
        ],
        coupon_lines: payload.couponCode ? [{ code: payload.couponCode }] : [],
        customer_note: payload.customerNote ?? '',
    };
    const { data } = await wooApi.post('/orders', body);
    return data;
};

export const fetchOrders = async (customerId: number, page = 1): Promise<WCOrder[]> => {
    const { data } = await wooApi.get('/orders', {
        params: { customer: customerId, per_page: 20, page },
    });
    return data;
};

export const fetchOrder = async (orderId: number): Promise<WCOrder> => {
    const { data } = await wooApi.get(`/orders/${orderId}`);
    return data;
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<WCOrder> => {
    const { data } = await wooApi.put(`/orders/${orderId}`, { status });
    return data;
};

export const markOrderPaid = async (orderId: number): Promise<WCOrder> => {
    const { data } = await wooApi.put(`/orders/${orderId}`, { set_paid: true });
    return data;
};

export const validateCoupon = async (code: string) => {
    const { data } = await wooApi.get('/coupons', { params: { code } });
    if (!data.length) throw new Error('Invalid coupon code');
    return data[0];
};

export const fetchShippingMethods = async (countryCode = 'IN') => {
    // Fetch all shipping zones and their methods
    const { data: zones } = await wooApi.get('/shipping/zones');
    const allMethods: any[] = [];
    for (const zone of zones.slice(0, 5)) {
        try {
            const { data: methods } = await wooApi.get(`/shipping/zones/${zone.id}/methods`);
            allMethods.push(...methods.map((m: any) => ({ ...m, zone_name: zone.name })));
        } catch { }
    }
    return allMethods;
};
