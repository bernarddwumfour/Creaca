export function apiMessage(error: any, fallback: string): string {
    return error?.response?.data?.message || error?.message || fallback;
}
