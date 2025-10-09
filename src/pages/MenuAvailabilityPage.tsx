import React, { useEffect, useMemo, useState } from "react";
import { fetchAllMenuItemsLite, setMenuAvailability, type MenuItemLite } from "../api/menuAvailability.api";
export default function MenuAvailabilityPage() {
    const [items, setItems] = useState<MenuItemLite[]>([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchAllMenuItemsLite();
            setItems(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggle = async (id: number, current: boolean) => {
        await setMenuAvailability(id, !current);
        setItems(prev => prev.map(x => x.id === id ? { ...x, available: !current } : x));
    };

    const filtered = useMemo(() => {
        const ql = q.trim().toLowerCase();
        return items.filter(x => x.name.toLowerCase().includes(ql));
    }, [items, q]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-3">Quản lý Còn/Hết món</h1>

            <div className="flex gap-2 items-center mb-3">
                <input
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    placeholder="Tìm món..."
                    className="border rounded px-3 py-2 w-full max-w-md"
                />
                <button onClick={load} className="px-3 py-2 rounded bg-gray-100 border">Làm mới</button>
            </div>

            {loading ? <div>Đang tải...</div> : (
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left border-b">
                        <th className="py-2">Món</th>
                        <th className="py-2">Giá</th>
                        <th className="py-2">Trạng thái</th>
                        <th className="py-2"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map(m => (
                        <tr key={m.id} className="border-b">
                            <td className="py-2">{m.name}</td>
                            <td className="py-2">{typeof m.price === "number" ? m.price.toLocaleString() : "-"}</td>
                            <td className="py-2">{m.available ? "Còn" : "Hết"}</td>
                            <td className="py-2">
                                <button
                                    onClick={() => toggle(m.id, m.available)}
                                    className={`px-3 py-1 rounded ${m.available ? "bg-red-500 text-white" : "bg-green-600 text-white"}`}
                                >
                                    {m.available ? "Đặt HẾT" : "Đặt CÒN"}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td className="py-4 text-gray-500" colSpan={4}>Không có món</td></tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
