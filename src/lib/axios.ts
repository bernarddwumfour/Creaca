import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENDPOINTS, PUBLIC_URLS } from './endpoints';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 15000,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isPublic = PUBLIC_URLS.some(url => config.url?.includes(url));
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (token && !isPublic && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        const serverResponse = error.response?.data as any;


        if (
            error.response?.status === 401 &&
            serverResponse?.message === "Token has expired" && // Check your backend message
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh_token');
                if (!refresh) throw new Error("No refresh token");

                const { data } = await axios.post(`${api.defaults.baseURL}${ENDPOINTS.AUTH.REFRESH}`, {}, {
                    headers: { Authorization: `Bearer ${refresh}` }
                });

                const newAccess = data.data.tokens.access;
                localStorage.setItem('access_token', newAccess);

                // Update the header for the original failed request
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);
export default api;