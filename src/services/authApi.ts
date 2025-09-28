import apiClient, { ApiResponse } from "./apiClient";

export interface LoginRequest {
    username: string; // Spring Security default field
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string; // thường là "Bearer"
}

export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post("/auth/login", data);
    },

    me: async (): Promise<ApiResponse<User>> => {
        return apiClient.get("/auth/me");
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        return apiClient.post("/auth/refresh", { refreshToken });
    },

    logout: async (): Promise<ApiResponse<null>> => {
        return apiClient.post("/auth/logout", {});
    },
};
