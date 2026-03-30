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
        USER_DETAIL: `${API_VERSION}/accounts/admin/users/:id/`,
        UPDATE_USER: `${API_VERSION}/accounts/admin/users/:id/update/`,
        ACTIVATE_USER: `${API_VERSION}/accounts/admin/users/:id/activate/`,
        DEACTIVATE_USER: `${API_VERSION}/accounts/admin/users/:id/deactivate/`,
        CHANGE_ROLE: `${API_VERSION}/accounts/admin/users/:id/change-role/`,
        BULK_STATUS_UPDATE: `${API_VERSION}/accounts/admin/users/bulk-status/`,
        BULK_CHANGE_ROLE: `${API_VERSION}/accounts/admin/users/bulk-change-role/`,
    },
} as const;

export const PUBLIC_URLS = [
    ENDPOINTS.AUTH.LOGIN,
    ENDPOINTS.AUTH.REGISTER,
    ENDPOINTS.AUTH.REFRESH,
];