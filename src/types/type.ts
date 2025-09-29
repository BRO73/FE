
// types/type.ts
export interface CategoryResponse {
    id: number;
    name: string;   // "main", "appetizer", "dessert", "beverage", "special"
    description?: string;
    imageUrl?: string;
}


// Response từ backend
export interface MenuItemResponse {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    status: "available" | "unavailable" | "seasonal";
    categoryName: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    activated: boolean;
}

// Data dùng cho form
export interface MenuItemFormData {
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    status: "available" | "unavailable" | "seasonal";
    categoryName: string; // lưu name của category
}


