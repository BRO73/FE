import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    getKitchenBoard,
    KitchenItem,
    KitchenFlatResponse,
    updateMenuAvailability,
} from "@/api/kitchenApi";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

type SortMode = "Newest" | "Oldest";

export default function KitchenDashboardPage() {
    const { toast } = useToast();

    // Phương án A: trạng thái không-null ngay từ đầu
    const [resp, setResp] = useState<KitchenFlatResponse>({
        serverTime: "",
        items: [],
    });
    const [sortMode, setSortMode] = useState<SortMode>("Newest");
    const [loading, setLoading] = useState(false);

    // track món mới để highlight 3s
    const seenRef = useRef<Set<number>>(new Set());
    const [recentHighlight, setRecentHighlight] = useState<Record<number, number>>({});

    // modal state
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<KitchenItem | null>(null);
    const [targetAvail, setTargetAvail] = useState<boolean>(true); // true = "Còn món", false = "Hết món"
    const [countdown, setCountdown] = useState<number>(0);

    // danh sách hiển thị (đã sort)
    const list: KitchenItem[] = useMemo(() => {
        const sorted = [...resp.items].sort((a, b) => {
            const ta = new Date(a.orderedAt).getTime();
            const tb = new Date(b.orderedAt).getTime();
            return sortMode === "Newest" ? tb - ta : ta - tb;
        });
        return sorted;
    }, [resp.items, sortMode]);

    // loader dùng được cả cho polling và nút Refresh
    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getKitchenBoard(50);
            const items = Array.isArray(data?.items) ? data.items : [];

            // highlight 3s cho item lần đầu nhìn thấy
            const now = Date.now();
            const nextRecent: Record<number, number> = {};
            for (const it of items) {
                if (!seenRef.current.has(it.orderDetailId)) {
                    nextRecent[it.orderDetailId] = now + 3000;
                    seenRef.current.add(it.orderDetailId);
                }
            }
            if (Object.keys(nextRecent).length > 0) {
                setRecentHighlight((curr) => ({ ...curr, ...nextRecent }));
            }

            setResp({
                serverTime: data?.serverTime ?? new Date().toISOString(),
                items,
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Không tải được dữ liệu bếp",
                description: "Vui lòng thử lại sau ít phút.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Poll mỗi 5s
    useEffect(() => {
        let alive = true;
        // gọi lần đầu
        loadDashboard();

        const t = setInterval(() => {
            if (alive) loadDashboard();
        }, 5000);

        return () => {
            alive = false;
            clearInterval(t);
        };
    }, [loadDashboard]);

    // clear highlight khi hết hạn (0.5s kiểm tra một lần)
    useEffect(() => {
        const t = setInterval(() => {
            const now = Date.now();
            let changed = false;
            const updated: Record<number, number> = {};
            for (const [idStr, expiry] of Object.entries(recentHighlight)) {
                if (expiry > now) {
                    updated[Number(idStr)] = expiry;
                } else {
                    changed = true;
                }
            }
            if (changed) setRecentHighlight(updated);
        }, 500);
        return () => clearInterval(t);
    }, [recentHighlight]);

    // mở modal; nếu là Hết món? → bật countdown 3s
    const openConfirm = (row: KitchenItem, makeAvailable: boolean) => {
        setSelected(row);
        setTargetAvail(makeAvailable);
        setCountdown(makeAvailable ? 0 : 3);
        setOpen(true);
    };

    // chạy countdown khi cần (Hết món?)
    useEffect(() => {
        if (!open || countdown <= 0) return;
        const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [open, countdown]);

    const handleConfirm = async () => {
        if (!selected) return;
        try {
            await updateMenuAvailability(selected.menuItemId, targetAvail);

            // ép literal type để không bị widen sang string
            const newStatus: KitchenItem["menuStatus"] = targetAvail ? "Available" : "Unavailable";

            // cập nhật UI tức thì (optimistic)
            setResp((prev) => {
                const patched: KitchenItem[] = prev.items.map((it) =>
                    it.menuItemId === selected.menuItemId ? { ...it, menuStatus: newStatus } : it
                );
                return { ...prev, items: patched };
            });

            toast({
                title: "Thành công",
                description: `Đã cập nhật: ${selected.dishName} → ${
                    targetAvail ? "Còn món" : "Hết món"
                }.`,
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Thất bại",
                description: "Không thể cập nhật, vui lòng thử lại.",
            });
        } finally {
            setOpen(false);
            setSelected(null);
            setCountdown(0);
        }
    };

    const renderRow = (it: KitchenItem) => {
        const isNew = !!recentHighlight[it.orderDetailId];
        const isAvailable = it.menuStatus === "Available";
        return (
            <div
                key={it.orderDetailId}
                className={`grid grid-cols-12 items-center gap-2 px-3 py-2 border-b ${
                    isNew ? "animate-pulse bg-yellow-50" : ""
                }`}
            >
                <div className="col-span-4 font-semibold">{it.dishName}</div>
                <div className="col-span-1 text-center">{it.quantity}</div>
                <div className="col-span-1 text-center">{it.tableNumber}</div>
                <div className="col-span-3 italic opacity-80 truncate">{it.notes ?? ""}</div>
                <div className="col-span-1 text-center">
                    {isAvailable ? "🟢 Còn món" : "🔴 Hết món"}
                </div>
                <div className="col-span-2 text-right">
                    {isAvailable ? (
                        <Button
                            variant="destructive"
                            onClick={() => openConfirm(it, false)}
                            aria-label={`Đánh dấu "${it.dishName}" hết món`}
                        >
                            Hết món?
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => openConfirm(it, true)}
                            aria-label={`Đánh dấu "${it.dishName}" còn món`}
                        >
                            Còn món?
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kitchen Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-sm opacity-70">
                            {resp.serverTime
                                ? `Server time: ${new Date(resp.serverTime).toLocaleString()}`
                                : "Đang tải..."}
                        </div>
                        <label className="text-sm">Sort:</label>
                        <select
                            className="border rounded px-2 py-1"
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value as SortMode)}
                        >
                            <option>Newest</option>
                            <option>Oldest</option>
                        </select>
                        <Button onClick={loadDashboard} disabled={loading}>
                            {loading ? "Đang tải..." : "Refresh"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-2 px-3 py-2 font-semibold border-b">
                    <div className="col-span-4">Món ăn</div>
                    <div className="col-span-1 text-center">SL</div>
                    <div className="col-span-1 text-center">Bàn</div>
                    <div className="col-span-3">Ghi chú</div>
                    <div className="col-span-1 text-center">Trạng thái</div>
                    <div className="col-span-2 text-right">Hành động</div>
                </div>

                {list.map(renderRow)}
                {list.length === 0 && (
                    <div className="text-center opacity-70 py-8">
                        {loading ? "Đang tải dữ liệu..." : "Chưa có món mới"}
                    </div>
                )}
            </div>

            {/* Modal xác nhận */}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {targetAvail ? "✅ Xác nhận còn món" : "❗ Xác nhận hết món"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selected
                                ? targetAvail
                                    ? `Bạn có chắc muốn mở lại món "${selected.dishName}" để có thể order trong các đơn mới không?`
                                    : `Bạn có chắc muốn đánh dấu món "${selected.dishName}" là Hết món không?`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCountdown(0)}>Huỷ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={!targetAvail && countdown > 0}>
                            {targetAvail ? "Xác nhận" : countdown > 0 ? `Xác nhận (${countdown})` : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
