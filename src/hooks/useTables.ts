import { useEffect, useState } from "react";
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} from "@/api/table.api";
import { TableResponse, TableFormData } from "@/types/type";

export const useTables = () => {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTables();
      setTables(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableById = async (id: number) => {
    return await getTableById(id);
  };

  const addTable = async (payload: TableFormData) => {
    const newTable = await createTable(payload);
    setTables((prev) => [...prev, newTable]);
    return newTable;
  };

  const editTable = async (id: number, payload: TableFormData) => {
    const updated = await updateTable(id, payload);
    setTables((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const removeTable = async (id: number) => {
    await deleteTable(id);
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    loading,
    error,
    fetchTables,
    fetchTableById,
    addTable,
    editTable,
    removeTable,
  };
};
