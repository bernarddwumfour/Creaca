const API_VERSION = '/api/v1';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_VERSION}/accounts/login/`,
        REGISTER: `${API_VERSION}/accounts/register/`,
        REFRESH: `${API_VERSION}/accounts/token/refresh/`,
        LOGOUT: `${API_VERSION}/accounts/logout/`,
        PROFILE: `${API_VERSION}/accounts/me/`,
        UPDATE_PROFILE: `${API_VERSION}/accounts/me/update/`,
        CHANGE_PASSWORD: `${API_VERSION}/accounts/password/change/`,
    },
    ADMIN: {
        USERS: `${API_VERSION}/accounts/admin/users/`,
        USER_DETAIL: (id: string | number) => `${API_VERSION}/accounts/admin/users/${id}/`,
        UPDATE_USER: (id: string | number) => `${API_VERSION}/accounts/admin/users/${id}/update/`,
    },
} as const;

export const PUBLIC_URLS = [
    ENDPOINTS.AUTH.LOGIN,
    ENDPOINTS.AUTH.REGISTER,
    ENDPOINTS.AUTH.REFRESH,
];