import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Table {
  id: number;
  number: string;
  floor: string;
  seats: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

const TableManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const [tables] = useState<Table[]>([
    { id: 1, number: "T01", floor: "Ground Floor", seats: 4, status: "available" },
    { id: 2, number: "T02", floor: "Ground Floor", seats: 2, status: "occupied" },
    { id: 3, number: "T03", floor: "Ground Floor", seats: 6, status: "reserved" },
    { id: 4, number: "T04", floor: "First Floor", seats: 4, status: "available" },
    { id: 5, number: "T05", floor: "First Floor", seats: 8, status: "maintenance" },
    { id: 6, number: "T06", floor: "First Floor", seats: 2, status: "available" },
    { id: 7, number: "T07", floor: "Ground Floor", seats: 4, status: "occupied" },
    { id: 8, number: "T08", floor: "Second Floor", seats: 6, status: "available" },
  ]);

  const filteredTables = tables.filter(table =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.floor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available": return "bg-success text-success-foreground";
      case "occupied": return "bg-warning text-warning-foreground";
      case "reserved": return "bg-primary text-primary-foreground";
      case "maintenance": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddTable = () => {
    toast({
      title: "Add Table",
      description: "Table creation form would open here",
    });
  };

  const handleEditTable = (table: Table) => {
    toast({
      title: "Edit Table",
      description: `Edit form for table ${table.number} would open here`,
    });
  };

  const handleDeleteTable = (table: Table) => {
    toast({
      title: "Delete Table",
      description: `Confirmation dialog for deleting table ${table.number} would appear here`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant tables, seating capacity, and availability status.
          </p>
        </div>
        <Button onClick={handleAddTable} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Table
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tables by number or floor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="desktop-table">
        <div className="table-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Tables ({filteredTables.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Table</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Floor</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Seats</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table) => (
                <tr key={table.id} className="table-row">
                  <td className="font-medium text-foreground">{table.number}</td>
                  <td className="text-muted-foreground">{table.floor}</td>
                  <td className="text-muted-foreground">{table.seats} seats</td>
                  <td>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTable(table)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTable(table)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredTables.map((table) => (
          <Card key={table.id} className="mobile-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">{table.number}</h4>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Floor:</span> {table.floor}</p>
              <p><span className="font-medium">Capacity:</span> {table.seats} seats</p>
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
    </div>
  );
};

export default TableManagementPage;