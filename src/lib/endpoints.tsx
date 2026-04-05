const API_VERSION = '/api/v1';

export const ENDPOINTS = {
    AUTH: {
        // Authentication
        LOGIN: `${API_VERSION}/accounts/login/`,
        GOOGLE: `${API_VERSION}/accounts/google/`,
        REGISTER: `${API_VERSION}/accounts/register/`,
        REFRESH: `${API_VERSION}/accounts/token/refresh/`,
        LOGOUT: `${API_VERSION}/accounts/logout/`,

        //Email verification
        RESEND_VERIFICATION: `${API_VERSION}/accounts/email/resend-verification/`,
        VERIFY_EMAIL: `${API_VERSION}/accounts/email/verify/`,


        //Reset password
        FORGOT_PASSWORD: `${API_VERSION}/accounts/password/forgot/`,
        RESET_PASSWORD: `${API_VERSION}/accounts/password/reset/`,
        RESEND_RESET_EMAIL: `${API_VERSION}/accounts/password/resend/`,

        // Profile
        PROFILE: `${API_VERSION}/accounts/me/`,
        UPDATE_PROFILE: `${API_VERSION}/accounts/me/update/`,
        CHANGE_PASSWORD: `${API_VERSION}/accounts/password/change/`,

        // Avatar endpoints
        UPDATE_AVATAR: `${API_VERSION}/accounts/me/avatar/update/`,
        RESET_AVATAR: `${API_VERSION}/accounts/me/avatar/reset/`,

        // MFA endpoints
        MFA_SETUP: `${API_VERSION}/accounts/mfa/setup/`,
        MFA_VERIFY: `${API_VERSION}/accounts/mfa/verify/`,
        MFA_DISABLE: `${API_VERSION}/accounts/mfa/disable/`,
        MFA_STATUS: `${API_VERSION}/accounts/mfa/status/`,
        MFA_VERIFY_LOGIN: `${API_VERSION}/accounts/mfa/verify-login/`,
        MFA_SEND_EMAIL_CODE: `${API_VERSION}/accounts/mfa/send-email-code/`,
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