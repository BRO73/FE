// utils/mappers.ts
import { MenuItem, MenuItemFormData, MenuItemResponse } from "@/types/type";

export const mapResponseToMenuItem = (res: MenuItemResponse): MenuItem => ({
    id: res.id,
    name: res.name,
    description: res.description,
    imageUrl: res.imageUrl,
    price: res.price,
    status: res.status,
    category: res.categoryName, // ✅ map categoryName -> category
});

export const mapToFormData = (item: MenuItem): MenuItemFormData => ({
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl ?? "",
    price: item.price,
    status: item.status,
    categoryName: item.category, // ✅ map back category -> categoryName
});
