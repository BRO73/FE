// import api from "@/api/axiosInstance";
import api from "@/api/apiClient";
import { MenuItemResponse, MenuItemFormData } from "@/types/type";

// Lấy tất cả menu items
export const getAllMenuItems = async (): Promise<MenuItemResponse[]> => {
    const response = await api.get<MenuItemResponse[]>("/menu-items");
    return response.data;
};

// Lấy menu item theo id
export const getMenuItemById = async (id: number): Promise<MenuItemResponse> => {
    const response = await api.get<MenuItemResponse>(`/menu-items/${id}`);
    return response.data;
};

// Tạo mới menu item
export const createMenuItem = async (
    data: MenuItemFormData
): Promise<MenuItemResponse> => {
    const payload = { ...data, categoryName: data.category };
    const response = await api.post<MenuItemResponse>("/menu-items", payload);
    return response.data;
};

// Cập nhật menu item
export const updateMenuItem = async (
    id: number,
    data: MenuItemFormData
): Promise<MenuItemResponse> => {
    const payload = { ...data, categoryName: data.category };
    const response = await api.put<MenuItemResponse>(`/menu-items/${id}`, payload);
    return response.data;
};

// Xóa menu item
export const deleteMenuItem = async (id: number): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
};

// Lấy menu items theo category
export const getMenuItemsByCategory = async (
    categoryName: string
): Promise<MenuItemResponse[]> => {
    const response = await api.get<MenuItemResponse[]>(`/menu-items/category/${categoryName}`);
    return response.data;
};

// Lấy menu items theo status
export const getMenuItemsByStatus = async (
    status: "available" | "unavailable" | "seasonal"
): Promise<MenuItemResponse[]> => {
    const response = await api.get<MenuItemResponse[]>(`/menu-items/status/${status}`);
    return response.data;
};

// Search menu items by name
export const searchMenuItemsByName = async (
    name: string
): Promise<MenuItemResponse[]> => {
    const response = await api.get<MenuItemResponse[]>(`/menu-items/search`, {
        params: { name },
    });
    return response.data;
};
