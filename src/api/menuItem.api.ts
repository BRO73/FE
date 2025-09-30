// api/menuItemApi.ts
import api from "@/api/axiosInstance";
import { MenuItemResponse, MenuItemFormData, MenuItem } from "@/types/type";

// Mapper: API → UI
const mapToMenuItem = (res: MenuItemResponse): MenuItem => ({
    id: res.id,
    name: res.name,
    description: res.description,
    imageUrl: res.imageUrl,
    price: res.price,
    status: res.status,
    category: res.categoryName, // ✅ map categoryName -> category
});

// --- API functions ---
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItemResponse[]>("/menu-items");
    return data.map(mapToMenuItem);
};

export const getMenuItemById = async (id: number): Promise<MenuItem> => {
    const { data } = await api.get<MenuItemResponse>(`/menu-items/${id}`);
    return mapToMenuItem(data);
};

export const createMenuItem = async (payload: MenuItemFormData): Promise<MenuItem> => {
    const { data } = await api.post<MenuItemResponse>("/menu-items", payload);
    return mapToMenuItem(data);
};

export const updateMenuItem = async (id: number, payload: MenuItemFormData): Promise<MenuItem> => {
    const { data } = await api.put<MenuItemResponse>(`/menu-items/${id}`, payload);
    return mapToMenuItem(data);
};

export const deleteMenuItem = async (id: number): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
};

export const getMenuItemsByCategory = async (categoryName: string): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItemResponse[]>(`/menu-items/category/${categoryName}`);
    return data.map(mapToMenuItem);
};

export const getMenuItemsByStatus = async (
    status: "available" | "unavailable" | "seasonal"
): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItemResponse[]>(`/menu-items/status/${status}`);
    return data.map(mapToMenuItem);
};

export const searchMenuItemsByName = async (name: string): Promise<MenuItem[]> => {
    const { data } = await api.get<MenuItemResponse[]>("/menu-items/search", { params: { name } });
    return data.map(mapToMenuItem);
};
