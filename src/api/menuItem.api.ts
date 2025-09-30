
import api from "@/api/axiosInstance";
import { MenuItemResponse, MenuItemFormData } from "@/types/type";

// Lấy tất cả menu items
export const getAllMenuItems = async (): Promise<MenuItemResponse[]> => {
    const { data } = await api.get<MenuItemResponse[]>("/menu-items");
    return data;
};

// Lấy menu item theo id
export const getMenuItemById = async (id: number): Promise<MenuItemResponse> => {
    const { data } = await api.get<MenuItemResponse>(`/menu-items/${id}`);
    return data;
};

// Tạo mới menu item
export const createMenuItem = async (payload: MenuItemFormData): Promise<MenuItemResponse> => {
    const { data } = await api.post<MenuItemResponse>("/menu-items", payload);
    return data;
};

// Cập nhật menu item
export const updateMenuItem = async (id: number, payload: MenuItemFormData): Promise<MenuItemResponse> => {
    const { data } = await api.put<MenuItemResponse>(`/menu-items/${id}`, payload);
    return data;
};

// Xóa menu item
export const deleteMenuItem = async (id: number): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
};

// Lấy menu items theo category
export const getMenuItemsByCategory = async (categoryName: string): Promise<MenuItemResponse[]> => {
    const { data } = await api.get<MenuItemResponse[]>(`/menu-items/category/${categoryName}`);
    return data;
};

// Lấy menu items theo status
export const getMenuItemsByStatus = async (
    status: "available" | "unavailable" | "seasonal"
): Promise<MenuItemResponse[]> => {
    const { data } = await api.get<MenuItemResponse[]>(`/menu-items/status/${status}`);
    return data;
};

// Search menu items by name
export const searchMenuItemsByName = async (name: string): Promise<MenuItemResponse[]> => {
    const { data } = await api.get<MenuItemResponse[]>("/menu-items/search", { params: { name } });
    return data;
};
