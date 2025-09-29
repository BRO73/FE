

// Response từ backend
export interface MenuItemResponse {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    status: "available" | "unavailable" | "seasonal";
    categoryName: "main" | "appetizer" | "dessert" | "beverage" | "special";
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
    category: "main" | "appetizer" | "dessert" | "beverage" | "special";
}
