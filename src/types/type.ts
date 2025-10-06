
// types/type.ts
export interface CategoryResponse {
    id: number;
    name: string;   // "main", "appetizer", "dessert", "beverage", "special"
    description?: string;
    imageUrl?: string;
}
export interface CategoryRequest {
    name: string;
    description: string;
    imageUrl: string;
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
// types/type.ts
export interface MenuItem {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    status: "available" | "unavailable" | "seasonal";
    category: string; // ✅ keep it as `category` for UI simplicity
}


export interface PageResponse<T> {
    content: T[];          // danh sách dữ liệu thực sự (list item)
    totalPages: number;    // tổng số trang
    totalElements: number; // tổng số phần tử
    size: number;          // số item mỗi trang
    number: number;        // số trang hiện tại (0-based)
    first: boolean;
    last: boolean;
    empty: boolean;
  }
  