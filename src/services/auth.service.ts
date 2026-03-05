import { wpApi, wooApi, WC_CONFIG, setAuthHeader, clearAuthHeader } from '../config/api';
import { WCUser } from '../types';

export const loginUser = async (email: string, password: string): Promise<{ token: string; user: WCUser }> => {
    // Step 1: get JWT token
    const tokenRes = await wpApi.post('/jwt-auth/v1/token', { username: email, password });
    const token = tokenRes.data.token;
    setAuthHeader(token);

    // Step 2: fetch customer profile
    const customersRes = await wooApi.get('/customers', { params: { email } });
    const customers = customersRes.data;
    if (!customers.length) throw new Error('User not found');
    return { token, user: customers[0] };
};

export const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<WCUser> => {
    const { data } = await wooApi.post('/customers', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: email,
    });
    return data;
};

export const resetPassword = async (email: string): Promise<void> => {
    // Uses WordPress lostpassword endpoint
    await wpApi.post('/wp/v2/users/lost-password', { user_login: email });
};

export const fetchCustomer = async (id: number): Promise<WCUser> => {
    const { data } = await wooApi.get(`/customers/${id}`);
    return data;
};

export const updateCustomer = async (id: number, updates: Partial<WCUser>): Promise<WCUser> => {
    const { data } = await wooApi.put(`/customers/${id}`, updates);
    return data;
};

export const logoutUser = () => {
    clearAuthHeader();
};
