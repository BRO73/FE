import axios from "axios";
import { MenuItemResponse, MenuItemFormData } from "@/types/type";

const API_URL = "http://localhost:8082/api/menu-items";

// Lấy tất cả
export const fetchAllMenuItems = () =>
    axios.get<MenuItemResponse[]>(API_URL);

// Lấy theo id
export const fetchMenuItemById = (id: number) =>
    axios.get<MenuItemResponse>(`${API_URL}/${id}`);

// Tạo mới
export const postMenuItem = (payload: any) =>
    axios.post<MenuItemResponse>(API_URL, payload);

// Cập nhật
export const putMenuItem = (id: number, payload: any) =>
    axios.put<MenuItemResponse>(`${API_URL}/${id}`, payload);

// Xóa
export const deleteMenuItemApi = (id: number) =>
    axios.delete(`${API_URL}/${id}`);

// Lấy theo category
export const fetchMenuItemsByCategory = (categoryName: string) =>
    axios.get<MenuItemResponse[]>(`${API_URL}/category/${categoryName}`);

// Lấy theo status
export const fetchMenuItemsByStatus = (
    status: "available" | "unavailable" | "seasonal"
) => axios.get<MenuItemResponse[]>(`${API_URL}/status/${status}`);

// Search
export const searchMenuItems = (name: string) =>
    axios.get<MenuItemResponse[]>(`${API_URL}/search`, { params: { name } });
