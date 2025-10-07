import React, { useMemo, useState } from "react";
import { useKitchen } from "../hooks/useKitchen";
import type { KitchenTicketDto } from "../api/kitchenApi";

type KitchenTicket = KitchenTicketDto;
type TabKey = "priority" | "byDish" | "byTable";

type GroupDish = {
    key: string;
    name: string;
    notes?: string | null;
    items: KitchenTicket[];
    earliest: number;
    totalQty: number;
};
type GroupTable = { key: string; table: string; items: KitchenTicket[] };

export default function KitchenDashboardPage() {
    const { loading, error, tickets, connected, updateStatus, refresh, completeOneUnit, completeAllUnits, serveOneUnit } =
        useKitchen({ intervalMs: 3000 });

    const pending: KitchenTicket[] = Array.isArray(tickets?.pending) ? (tickets!.pending as KitchenTicket[]) : [];
    const working: KitchenTicket[] = Array.isArray(tickets?.inProgress) ? (tickets!.inProgress as KitchenTicket[]) : [];
    const ready: KitchenTicket[] = Array.isArray(tickets?.ready) ? (tickets!.ready as KitchenTicket[]) : [];

    const [active, setActive] = useState<TabKey>("priority");
    const [q, setQ] = useState("");

    const matchQ = (s?: string) => (q ? (s || "").toLowerCase().includes(q.toLowerCase()) : true);

    const priorityList: KitchenTicket[] = useMemo(() => {
        const all: KitchenTicket[] = [...pending, ...working];
        all.sort((a, b) => {
            const ta = a.orderedAt ? Date.parse(a.orderedAt) : 0;
            const tb = b.orderedAt ? Date.parse(b.orderedAt) : 0;
            if (ta !== tb) return ta - tb;
            return (a.orderDetailId || 0) - (b.orderDetailId || 0);
        });
        return all.filter((t) => matchQ(t.dishName) || matchQ(t.tableNumber));
    }, [pending, working, q]);

    const byDish: GroupDish[] = useMemo(() => {
        const all: KitchenTicket[] = [...pending, ...working];
        const groups = new Map<string, { key: string; name: string; notes?: string | null; items: KitchenTicket[] }>();
        for (const t of all) {
            if (!(matchQ(t.dishName) || matchQ(t.tableNumber))) continue;
            const notesKey = (t.notes || "").trim().toLowerCase();
            const key = `${t.dishName}__${notesKey}`;
            if (!groups.has(key)) groups.set(key, { key, name: t.dishName, notes: t.notes, items: [] });
            groups.get(key)!.items.push(t);
        }
        const list: GroupDish[] = Array.from(groups.values()).map((g) => {
            const earliest = g.items.map((i) => (i.orderedAt ? Date.parse(i.orderedAt) : 0)).sort((a, b) => a - b)[0] ?? 0;
            return { ...g, earliest, totalQty: g.items.reduce((s, i) => s + (i.quantity ?? 0), 0) };
        });
        list.sort((a, b) => a.earliest - b.earliest);
        return list;
    }, [pending, working, q]);

    const byTable: GroupTable[] = useMemo(() => {
        const all: KitchenTicket[] = [...pending, ...working];
        const groups = new Map<string, GroupTable>();
        for (const t of all) {
            const table = t.tableNumber || "N/A";
            if (!(matchQ(t.dishName) || matchQ(table))) continue;
            if (!groups.has(table)) groups.set(table, { key: table, table, items: [] });
            groups.get(table)!.items.push(t);
        }
        const list: GroupTable[] = Array.from(groups.values()).map((g) => {
            g.items.sort((a, b) => {
                const ta = a.orderedAt ? Date.parse(a.orderedAt) : 0;
                const tb = b.orderedAt ? Date.parse(b.orderedAt) : 0;
                return ta - tb;
            });
            return g;
        });
        list.sort((a, b) => a.table.localeCompare(b.table, "vi"));
        return list;
    }, [pending, working, q]);

    return (
        <div style={page}>
            <header style={header}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ margin: 0, color: "#111827" }}>Màn hình Bếp</h2>
                    <span title={connected ? "Đang kết nối nguồn dữ liệu" : "Mất kết nối"}>{connected ? "🟢" : "🔴"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Tìm theo tên món / số bàn (F3)" value={q} onChange={(e) => setQ(e.target.value)} style={searchInput} />
                    <button onClick={() => refresh()} style={btnPrimary}>
                        Làm mới
                    </button>
                </div>
            </header>

            {loading && <div style={bannerInfo}>Đang tải dữ liệu bếp…</div>}
            {!loading && error && <div style={bannerError}>Lỗi: {error}</div>}

            <div style={grid}>
               
                <section style={leftCol}>
                    <div style={tabs}>
                        <button onClick={() => setActive("priority")} style={tabBtn(active === "priority")}>
                            Ưu tiên
                        </button>
                        <button onClick={() => setActive("byDish")} style={tabBtn(active === "byDish")}>
                            Theo món
                        </button>
                        <button onClick={() => setActive("byTable")} style={tabBtn(active === "byTable")}>
                            Theo phòng/bàn
                        </button>
                    </div>

                    {/* Ưu tiên */}
                    <div style={{ display: active === "priority" ? "block" : "none" }}>
                        {priorityList.length === 0 ? (
                            <EmptyBox title="Không có món nào cần chế biến." />
                        ) : (
                            <ul style={list}>
                                {priorityList.map((t) => {
                                    const showActions = isPending(t.status) || isInProgress(t.status);
                                    return (
                                        <li key={`p-${t.orderDetailId}`} style={card}>
                                            <div style={row}>
                                                <strong style={{ color: "#111827" }}>{t.dishName}</strong>
                                                <QtyBadge qty={t.quantity} />
                                            </div>
                                            <div style={muted}>
                                                Bàn: <b>{t.tableNumber}</b> • ID: {t.orderDetailId} {t.orderedAt ? `• ${fmtTime(t.orderedAt)}` : ""}
                                            </div>
                                            {t.notes ? <div style={{ ...muted, fontStyle: "italic" }}>Ghi chú: {t.notes}</div> : null}

                                            {showActions && (
                                                <div style={{ ...row, marginTop: 8, gap: 6, justifyContent: "flex-end" }}>

                                                    {t.quantity >= 2 && (
                                                        <button title="Hoàn tất 1 đơn vị" style={btnOne} onClick={() => completeOneUnit(t.orderDetailId)}>
                                                            &gt;
                                                        </button>
                                                    )}

                                                    <button title="Hoàn tất toàn bộ" style={btnAll} onClick={() => completeAllUnits(t.orderDetailId)}>
                                                        &gt;&gt;
                                                    </button>
                                                    <button style={btnDangerSm} onClick={() => confirmCancel(() => updateStatus(t.orderDetailId, "CANCELED"))}>
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Theo món */}
                    <div style={{ display: active === "byDish" ? "block" : "none" }}>
                        {byDish.length === 0 ? (
                            <EmptyBox title="Không có nhóm món." />
                        ) : (
                            <ul style={list}>
                                {byDish.map((g) => (
                                    <li key={g.key} style={card}>
                                        <div style={row}>
                                            <strong style={{ color: "#111827" }}>{g.name}</strong>
                                            <span style={pillDark}>Tổng: {g.totalQty}</span>
                                        </div>
                                        {g.notes ? <div style={{ ...muted, fontStyle: "italic" }}>Ghi chú: {g.notes}</div> : null}
                                        <div style={{ ...row, marginTop: 8, flexWrap: "wrap", gap: 6, justifyContent: "flex-start" }}>
                                            {g.items.slice(0, 8).map((t) => (
                                                <span key={t.orderDetailId} style={chip}>
                          {t.tableNumber} x{t.quantity}
                        </span>
                                            ))}
                                            {g.items.length > 8 && <span style={muted}>+{g.items.length - 8}…</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Theo bàn */}
                    <div style={{ display: active === "byTable" ? "block" : "none" }}>
                        {byTable.length === 0 ? (
                            <EmptyBox title="Không có bàn nào có món cần chế biến." />
                        ) : (
                            <ul style={list}>
                                {byTable.map((g) => (
                                    <li key={g.key} style={card}>
                                        <div style={row}>
                                            <strong style={{ color: "#111827" }}>Bàn {g.table}</strong>
                                        </div>
                                        <ul style={{ ...list, marginTop: 8 }}>
                                            {g.items.map((t) => (
                                                <li key={t.orderDetailId} style={{ ...row, padding: "6px 0", borderBottom: "1px dashed #eee" }}>
                                                    <span>{t.dishName}</span>
                                                    <span>x{t.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* RIGHT: Đã xong / Chờ cung ứng */}
                <aside style={rightCol}>
                    <h3 style={{ marginTop: 0, color: "#111827" }}>Đã xong / Chờ cung ứng</h3>
                    {ready.length === 0 ? (
                        <EmptyBox title="Chưa có món mới hoàn tất.">
                            <button onClick={() => refresh()} style={btnPrimary}>
                                Làm mới
                            </button>
                        </EmptyBox>
                    ) : (
                        <ul style={list}>
                            {ready
                                .slice()
                                .sort((a, b) => {
                                    const ta = a.orderedAt ? Date.parse(a.orderedAt) : 0;
                                    const tb = b.orderedAt ? Date.parse(b.orderedAt) : 0;
                                    return tb - ta;
                                })
                                .map((t) => (
                                    <li key={`r-${t.orderDetailId}`} style={cardSoft}>
                                        <div style={row}>
                                            <strong style={{ color: "#065f46" }}>{t.dishName}</strong>
                                            <QtyBadge qty={t.quantity} accent="green" />
                                        </div>
                                        <div style={{ ...muted, color: "#065f46" }}>
                                            Bàn: <b>{t.tableNumber}</b> • ID: {t.orderDetailId}
                                        </div>
                                        <div style={{ ...row, marginTop: 8, gap: 6, justifyContent: "flex-end" }}>
                                            {t.quantity > 2 && (
                                                <button title="Xuất 1 đơn vị" style={btnOneGreen} onClick={() => serveOneUnit(t.orderDetailId)}>
                                                    &gt;
                                                </button>
                                            )}
                                            {/* Nếu muốn thêm “>> Xuất hết”, có thể thêm sau */}
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </aside>
            </div>
        </div>
    );
}

/* ===== Components nhỏ ===== */
function EmptyBox({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div style={emptyBox}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: "#111827" }}>{title}</div>
            {children ? <div style={{ marginTop: 8 }}>{children}</div> : <div style={{ color: "#6b7280" }}>—</div>}
        </div>
    );
}
function QtyBadge({ qty, accent }: { qty: number; accent?: "green" | "gray" }) {
    const style = accent === "green" ? pillGreen : pillDark;
    return <span style={style}>x{qty}</span>;
}

/* ===== Helpers ===== */
function fmtTime(iso: string): string {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
}
function normStatus(s?: string) {
    return (s || "").trim().toUpperCase().replace(/[-\s]+/g, "_");
}
function isPending(s?: string) {
    return normStatus(s) === "PENDING";
}
function isInProgress(s?: string) {
    return normStatus(s) === "IN_PROGRESS";
}

/* ===== Styles – nền xám ấm, chữ đậm, card nổi (không trắng xoá nữa) ===== */
const page: React.CSSProperties = {
    padding: 16,
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    background: "#f5f6f8",
    color: "#111827",
    minHeight: "100vh",
};

const header: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
};

const searchInput: React.CSSProperties = {
    height: 40,
    minWidth: 320,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "0 12px",
    background: "#fff",
    color: "#111827",
    boxShadow: "inset 0 1px 1px rgba(0,0,0,0.04)",
};

const bannerInfo: React.CSSProperties = {
    background: "#eef2ff",
    color: "#3730a3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    border: "1px solid #c7d2fe",
};

const bannerError: React.CSSProperties = {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    border: "1px solid #fecaca",
};

const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 16,
    alignItems: "start",
};

const leftCol: React.CSSProperties = { minHeight: 420 };
const rightCol: React.CSSProperties = { position: "sticky", top: 16, alignSelf: "start" };

const tabs: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 12 };
const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    border: active ? "1px solid #111827" : "1px solid #e5e7eb",
    borderRadius: 999,
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111827",
    cursor: "pointer",
    boxShadow: active ? "0 2px 6px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.05)",
});

const list: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 };

const card: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
    color: "#111827",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const cardSoft: React.CSSProperties = {
    border: "1px solid #bbf7d0",
    borderRadius: 14,
    padding: 12,
    background: "#f0fdf4",
    color: "#065f46",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 };
const muted: React.CSSProperties = { color: "#6b7280", fontSize: 13 };
const chip: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    background: "#fff",
    color: "#111827",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const btnPrimary: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
};

const btnDangerSm: React.CSSProperties = {
    padding: "6px 8px",
    borderRadius: 10,
    border: "1px solid #ef4444",
    background: "#fee2e2",
    color: "#991b1b",
    cursor: "pointer",
};

const pillDark: React.CSSProperties = {
    border: "1px solid #111827",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    background: "#111827",
    color: "#fff",
};
const pillGreen: React.CSSProperties = {
    border: "1px solid #16a34a",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
    background: "#16a34a",
    color: "#fff",
};

const emptyBox: React.CSSProperties = {
    padding: 14,
    border: "1px dashed #e5e7eb",
    borderRadius: 14,
    background: "#fafafa",
    color: "#374151",
};

const btnOne: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #2563eb",
    background: "#dbeafe",
    color: "#1e3a8a",
    cursor: "pointer",
    fontWeight: 700,
};
const btnAll: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #7c3aed",
    background: "#ede9fe",
    color: "#5b21b6",
    cursor: "pointer",
    fontWeight: 700,
};
const btnOneGreen: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #16a34a",
    background: "#dcfce7",
    color: "#166534",
    cursor: "pointer",
    fontWeight: 700,
};

/* confirm */
function confirmCancel(run: () => void) {
    if (window.confirm("Bạn chắc chắn muốn hủy món này?")) run();
}
