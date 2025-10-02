import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TableFormModal from "@/components/forms/TableFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";
import { useTables } from "@/hooks/useTables";
import { TableFormData, TableResponse } from "@/types/type";

const TableManagementPage = () => {
  const { toast } = useToast();
  const {
    tables,
    loading,
    error,
    addTable,
    editTable,
    removeTable,
  } = useTables();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedTable, setSelectedTable] = useState<TableResponse | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTables = tables.filter(
    (table) =>
      table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: TableResponse["status"]) => {
    switch (status) {
      case "available": return "bg-success text-success-foreground";
      case "occupied": return "bg-warning text-warning-foreground";
      case "reserved": return "bg-primary text-primary-foreground";
      case "maintenance": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddTable = () => {
    setFormMode("add");
    setSelectedTable(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditTable = (table: TableResponse) => {
    setFormMode("edit");
    setSelectedTable(table);
    setIsFormModalOpen(true);
  };

  const handleDeleteTable = (table: TableResponse) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: TableFormData) => {
    setIsSubmitting(true);
    try {
      if (formMode === "add") {
        await addTable(data);
        toast({ title: "Table Added", description: `Table ${data.tableNumber} has been added.` });
      } else if (formMode === "edit" && selectedTable) {
        await editTable(selectedTable.id, data);
        toast({ title: "Table Updated", description: `Table ${data.tableNumber} has been updated.` });
      }
      setIsFormModalOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save table.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTable) return;
    setIsSubmitting(true);
    try {
      await removeTable(selectedTable.id);
      toast({ title: "Table Deleted", description: `Table ${selectedTable.tableNumber} deleted.` });
      setIsDeleteDialogOpen(false);
      setSelectedTable(undefined);
    } catch {
      toast({ title: "Error", description: "Failed to delete table.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground mt-1">Manage tables and availability.</p>
        </div>
        <Button onClick={handleAddTable} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add New Table
        </Button>
      </div>

      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <Card className="desktop-table">
        <div className="table-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Tables ({filteredTables.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6">Table</th>
                <th className="text-left py-4 px-6">Capacity</th>
                <th className="text-left py-4 px-6">Location</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-right py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-6 text-red-500">{error}</td></tr>
              ) : (
                filteredTables.map((table) => (
                  <tr key={table.id} className="table-row">
                    <td>{table.tableNumber}</td>
                    <td>{table.capacity} seats</td>
                    <td>{table.locationName}</td>
                    <td><Badge className={getStatusColor(table.status)}>{table.status}</Badge></td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTable(table)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTable(table)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredTables.map((table) => (
          <Card key={table.id} className="mobile-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">{table.tableNumber}</h4>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Floor:</span> {table.locationName}</p>
              <p><span className="font-medium">Capacity:</span> {table.capacity} seats</p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditTable(table)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteTable(table)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <TableFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        table={selectedTable}
        mode={formMode}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Table"
        description="Are you sure you want to delete"
        itemName={selectedTable?.tableNumber}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default TableManagementPage;
