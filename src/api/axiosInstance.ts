// src/api/axiosInstance.ts
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
    AxiosHeaders,
} from "axios";

type RefreshResponse = {
    accessToken: string;
    refreshToken?: string;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const BASE_URL =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
    "/api"; // Dùng Vite proxy thì để "/api", nếu không thì set VITE_API_URL="http://localhost:8082/api"

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==== Token helpers ====
function getAccessToken(): string | null {
    try {
        return localStorage.getItem("accessToken");
    } catch {
        return null;
    }
}
function getRefreshToken(): string | null {
    try {
        return localStorage.getItem("refreshToken");
    } catch {
        return null;
    }
}
function setTokens(access: string, refresh?: string | null): void {
    try {
        localStorage.setItem("accessToken", access);
        if (refresh) localStorage.setItem("refreshToken", refresh);
    } catch {
        /* ignore */
    }
}
function clearTokens(): void {
    try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    } catch {
        /* ignore */
    }
}

// ==== Headers helpers (tránh TS2322) ====
function ensureHeaders(cfg: InternalAxiosRequestConfig): AxiosHeaders {
    const current = cfg.headers;
    if (!current) {
        const created = new AxiosHeaders();
        cfg.headers = created;
        return created;
    }
    if (current instanceof AxiosHeaders) {
        return current;
    }
    // Convert plain object -> AxiosHeaders (giữ các header dạng string)
    const created = new AxiosHeaders();
    Object.entries(current as Record<string, unknown>).forEach(([k, v]) => {
        if (typeof v === "string") created.set(k, v);
    });
    cfg.headers = created;
    return created;
}

// ==== Request: attach Authorization ====
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
        const headers = ensureHeaders(config);
        headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

// ==== Refresh logic ====
let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
    const rt = getRefreshToken();
    if (!rt) return null;
    const resp = await axios.post<RefreshResponse>(`${BASE_URL}/auth/refresh`, { refreshToken: rt });
    const newAccess = resp.data?.accessToken ?? null;
    const newRefresh = resp.data?.refreshToken ?? null;
    if (newAccess) setTokens(newAccess, newRefresh);
    return newAccess;
}

// ==== Response: on 401 -> refresh -> retry ====
api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const original = (error.config || {}) as RetryConfig;
        const status = error.response?.status;

        if (status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                const token = await new Promise<string | null>((resolve) => waiters.push(resolve));
                if (token) {
                    const headers = ensureHeaders(original);
                    headers.set("Authorization", `Bearer ${token}`);
                    return api(original);
                }
            } else {
                isRefreshing = true;
                try {
                    const token = await refreshAccessToken();
                    // đánh thức các request đang chờ
                    waiters.forEach((fn) => fn(token));
                    waiters = [];
                    if (token) {
                        const headers = ensureHeaders(original);
                        headers.set("Authorization", `Bearer ${token}`);
                        return api(original);
                    }
                } catch {
                    // ignore
                } finally {
                    isRefreshing = false;
                }
            }

            // refresh thất bại
            clearTokens();
            // window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
