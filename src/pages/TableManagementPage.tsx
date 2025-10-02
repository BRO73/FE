import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TableFormModal from "@/components/forms/TableFormModal";
import LocationFormModal from "@/components/forms/LocationFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";

interface Table {
  id: number;
  number: string;
  floor: string;
  seats: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

interface Location {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const TableManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLocationFormModalOpen, setIsLocationFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLocationDeleteDialogOpen, setIsLocationDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [locationFormMode, setLocationFormMode] = useState<"add" | "edit">("add");
  const [selectedTable, setSelectedTable] = useState<Table | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: "T01", floor: "Ground Floor", seats: 4, status: "available" },
    { id: 2, number: "T02", floor: "Ground Floor", seats: 2, status: "occupied" },
    { id: 3, number: "T03", floor: "Ground Floor", seats: 6, status: "reserved" },
    { id: 4, number: "T04", floor: "First Floor", seats: 4, status: "available" },
    { id: 5, number: "T05", floor: "First Floor", seats: 8, status: "maintenance" },
    { id: 6, number: "T06", floor: "First Floor", seats: 2, status: "available" },
    { id: 7, number: "T07", floor: "Ground Floor", seats: 4, status: "occupied" },
    { id: 8, number: "T08", floor: "Second Floor", seats: 6, status: "available" },
  ]);

  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Ground Floor", slug: "ground-floor", description: "Main dining area on the ground level" },
    { id: 2, name: "First Floor", slug: "first-floor", description: "Upper dining area with scenic views" },
    { id: 3, name: "Second Floor", slug: "second-floor", description: "Private dining rooms and events" },
    { id: 4, name: "Outdoor Patio", slug: "outdoor-patio", description: "Al fresco dining area" },
  ]);

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.floor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocationFilter === "all" || table.floor === selectedLocationFilter;
    return matchesSearch && matchesLocation;
  });

  const filteredLocations = locations.filter(location =>
      location.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
      location.slug.toLowerCase().includes(locationSearchTerm.toLowerCase())
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
    setFormMode("add");
    setSelectedTable(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setFormMode("edit");
    setSelectedTable(table);
    setIsFormModalOpen(true);
  };

  const handleDeleteTable = (table: Table) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (formMode === "add") {
      const newTable: Table = {
        id: Math.max(...tables.map(t => t.id)) + 1,
        ...data,
      };
      setTables([...tables, newTable]);
    } else if (formMode === "edit" && selectedTable) {
      setTables(tables.map(t =>
          t.id === selectedTable.id ? { ...selectedTable, ...data } : t
      ));
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTable) return;

    setIsSubmitting(true);
    try {
      setTables(tables.filter(t => t.id !== selectedTable.id));
      toast({
        title: "Table Deleted",
        description: `Table ${selectedTable.number} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedTable(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete table. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Location handlers
  const handleAddLocation = () => {
    setLocationFormMode("add");
    setSelectedLocation(undefined);
    setIsLocationFormModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setLocationFormMode("edit");
    setSelectedLocation(location);
    setIsLocationFormModalOpen(true);
  };

  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsLocationDeleteDialogOpen(true);
  };

  const handleLocationFormSubmit = (data: any) => {
    if (locationFormMode === "add") {
      const newLocation: Location = {
        id: Math.max(...locations.map(l => l.id)) + 1,
        ...data,
      };
      setLocations([...locations, newLocation]);
    } else if (locationFormMode === "edit" && selectedLocation) {
      setLocations(locations.map(l =>
          l.id === selectedLocation.id ? { ...selectedLocation, ...data } : l
      ));
    }
    setIsLocationFormModalOpen(false);
  };

  const handleLocationDeleteConfirm = async () => {
    if (!selectedLocation) return;

    setIsSubmitting(true);
    try {
      setLocations(locations.filter(l => l.id !== selectedLocation.id));
      toast({
        title: "Location Deleted",
        description: `Location "${selectedLocation.name}" has been deleted successfully.`,
      });
      setIsLocationDeleteDialogOpen(false);
      setSelectedLocation(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant tables, locations, seating capacity, and availability status.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Card className="dashboard-card flex-1">
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
                  <select
                      value={selectedLocationFilter}
                      onChange={(e) => setSelectedLocationFilter(e.target.value)}
                      className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="all">All Locations</option>
                    {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                    ))}
                  </select>
                </div>
              </Card>
              <Button onClick={handleAddTable} className="btn-primary whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
            </div>

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
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Card className="dashboard-card flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                      placeholder="Search locations..."
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
              </Card>
              <Button onClick={handleAddLocation} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>

            {/* Desktop Location View */}
            <Card className="desktop-table">
              <div className="table-header flex items-center justify-between">
                <h3 className="text-lg font-semibold">All Locations ({filteredLocations.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Slug</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Description</th>
                    <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredLocations.map((location) => (
                      <tr key={location.id} className="table-row">
                        <td className="font-medium text-foreground">{location.name}</td>
                        <td className="text-muted-foreground">
                          <Badge variant="secondary">{location.slug}</Badge>
                        </td>
                        <td className="text-muted-foreground max-w-md truncate">
                          {location.description || "-"}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLocation(location)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLocation(location)}
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

            {/* Mobile Location View */}
            <div className="lg:hidden space-y-4">
              {filteredLocations.map((location) => (
                  <Card key={location.id} className="mobile-card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{location.name}</h4>
                      <Badge variant="secondary">{location.slug}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{location.description || "No description"}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditLocation(location)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLocation(location)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <TableFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            table={selectedTable}
            mode={formMode}
        />

        <LocationFormModal
            isOpen={isLocationFormModalOpen}
            onClose={() => setIsLocationFormModalOpen(false)}
            onSubmit={handleLocationFormSubmit}
            location={selectedLocation}
            mode={locationFormMode}
        />

        <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Table"
            description="Are you sure you want to delete"
            itemName={selectedTable?.number}
            isLoading={isSubmitting}
        />

        <DeleteConfirmDialog
            isOpen={isLocationDeleteDialogOpen}
            onClose={() => setIsLocationDeleteDialogOpen(false)}
            onConfirm={handleLocationDeleteConfirm}
            title="Delete Location"
            description="Are you sure you want to delete"
            itemName={selectedLocation?.name}
            isLoading={isSubmitting}
        />
      </div>
  );
};

export default TableManagementPage;