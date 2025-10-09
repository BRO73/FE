import axios from "./axiosInstance";

export type MenuItemLite = {
    id: number;
    name: string;
    price: number;
    available: boolean;
};

export async function fetchAllMenuItemsLite(): Promise<MenuItemLite[]> {
    const res = await axios.get<MenuItemLite[]>("/menu/items");
    return res.data;
}

export async function setMenuAvailability(id: number, available: boolean): Promise<void> {
    await axios.patch(`/menu/items/${id}/availability`, { available });
}
