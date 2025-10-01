// src/api/kitchenApi.ts
import api from "./apiClient";
import type { AxiosResponse } from "axios";

export type KitchenItem = {
    orderDetailId: number;
    orderId: number;
    tableNumber: string;
    menuItemId: number;
    dishName: string;
    quantity: number;
    menuStatus: "Available" | "Unavailable";
    status: "Pending" | "In Progress" | "Completed" | "Canceled";
    notes: string | null;
    orderedAt: string;
};

export type KitchenFlatResponse = {
    serverTime: string;
    items: KitchenItem[];
};

// Các shape có thể trả về từ BE
type KitchenBoardApiV1 = {
    serverTime?: string;
    items?: unknown; // sẽ check bằng type guard
};

type KitchenBoardApiLegacy = {
    serverTime?: string;
    pending?: unknown;
    inProgress?: unknown;
};

// -------- Type guards (không dùng any) --------
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function hasArrayKey(obj: unknown, key: string): boolean {
    return isRecord(obj) && Array.isArray((obj as Record<string, unknown>)[key]);
}

function isKitchenBoardV1(v: unknown): v is KitchenBoardApiV1 {
    return hasArrayKey(v, "items");
}

function isKitchenBoardLegacy(v: unknown): v is KitchenBoardApiLegacy {
    return hasArrayKey(v, "pending") || hasArrayKey(v, "inProgress");
}

function isAxiosResponse<T>(v: unknown): v is AxiosResponse<T> {
    return isRecord(v) && "data" in v;
}

// Chuẩn hoá payload về { serverTime, items }
function normalizeKitchenPayload(raw: unknown): KitchenFlatResponse {
    // ✅ Thu hẹp kiểu serverTime an toàn, tránh 'unknown' → 'string'
    let serverTime: string;
    if (isRecord(raw)) {
        const st = (raw as Record<string, unknown>).serverTime;
        serverTime = typeof st === "string" ? st : new Date().toISOString();
    } else {
        serverTime = new Date().toISOString();
    }

    if (isKitchenBoardV1(raw)) {
        const itemsUnknown = (raw as Record<string, unknown>)["items"];
        const items = Array.isArray(itemsUnknown) ? (itemsUnknown as KitchenItem[]) : [];
        return { serverTime, items };
    }

    if (isKitchenBoardLegacy(raw)) {
        const pendingUnknown = (raw as Record<string, unknown>)["pending"];
        const inProgressUnknown = (raw as Record<string, unknown>)["inProgress"];
        const pending = Array.isArray(pendingUnknown) ? (pendingUnknown as KitchenItem[]) : [];
        const inProgress = Array.isArray(inProgressUnknown) ? (inProgressUnknown as KitchenItem[]) : [];
        return { serverTime, items: [...pending, ...inProgress] };
    }

    // fallback an toàn
    return { serverTime, items: [] };
}

/**
 * Lấy dashboard bếp.
 * Hoạt động tốt dù axios có unwrap .data hay không.
 */
export async function getKitchenBoard(limit = 50): Promise<KitchenFlatResponse> {
    const res = await api.get<KitchenBoardApiV1 | KitchenBoardApiLegacy>("/kitchen", {
        params: { limit },
    });

    const payload: unknown = isAxiosResponse<KitchenBoardApiV1 | KitchenBoardApiLegacy>(res)
        ? res.data
        : res;

    return normalizeKitchenPayload(payload);
}

/**
 * Cập nhật trạng thái khả dụng của món (Còn món / Hết món).
 * ĐÃ chỉnh endpoint khớp BE: /api/kitchen/menu-items/{id}/availability
 */
export async function updateMenuAvailability(
    menuItemId: number,
    available: boolean
): Promise<void> {
    await api.patch(`/kitchen/menu-items/${menuItemId}/availability`, { available });
}
