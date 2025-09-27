import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MenuItemFormModal from "@/components/forms/MenuItemFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";

interface MenuItem {
  id: number;
  name: string;
  category: "appetizer" | "main" | "dessert" | "beverage" | "special";
  price: number;
  description: string;
  status: "available" | "unavailable" | "seasonal";
  prepTime: number; // in minutes
}

const MenuManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: "Caesar Salad", category: "appetizer", price: 12.99, description: "Fresh romaine lettuce with parmesan cheese", status: "available", prepTime: 10 },
    { id: 2, name: "Grilled Salmon", category: "main", price: 28.99, description: "Atlantic salmon with lemon butter sauce", status: "available", prepTime: 25 },
    { id: 3, name: "Chocolate Lava Cake", category: "dessert", price: 8.99, description: "Warm chocolate cake with vanilla ice cream", status: "available", prepTime: 15 },
    { id: 4, name: "Craft Beer", category: "beverage", price: 6.99, description: "Local brewery selection", status: "available", prepTime: 2 },
    { id: 5, name: "Truffle Pasta", category: "special", price: 35.99, description: "Handmade pasta with black truffle", status: "seasonal", prepTime: 30 },
    { id: 6, name: "Fish & Chips", category: "main", price: 18.99, description: "Beer battered cod with fries", status: "unavailable", prepTime: 20 },
    { id: 7, name: "Bruschetta", category: "appetizer", price: 9.99, description: "Toasted bread with tomato and basil", status: "available", prepTime: 8 },
    { id: 8, name: "Tiramisu", category: "dessert", price: 9.99, description: "Classic Italian dessert", status: "available", prepTime: 5 },
  ]);

  const categories = ["all", "appetizer", "main", "dessert", "beverage", "special"];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: MenuItem["status"]) => {
    switch (status) {
      case "available": return "bg-success text-success-foreground";
      case "unavailable": return "bg-destructive text-destructive-foreground";
      case "seasonal": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: MenuItem["category"]) => {
    switch (category) {
      case "appetizer": return "bg-emerald-500 text-white";
      case "main": return "bg-blue-500 text-white";
      case "dessert": return "bg-pink-500 text-white";
      case "beverage": return "bg-amber-500 text-white";
      case "special": return "bg-purple-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddMenuItem = () => {
    setFormMode("add");
    setSelectedMenuItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setFormMode("edit");
    setSelectedMenuItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (formMode === "add") {
      const newMenuItem: MenuItem = {
        id: Math.max(...menuItems.map(m => m.id)) + 1,
        ...data,
      };
      setMenuItems([...menuItems, newMenuItem]);
    } else if (formMode === "edit" && selectedMenuItem) {
      setMenuItems(menuItems.map(m => 
        m.id === selectedMenuItem.id ? { ...selectedMenuItem, ...data } : m
      ));
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenuItem) return;
    
    setIsSubmitting(true);
    try {
      setMenuItems(menuItems.filter(m => m.id !== selectedMenuItem.id));
      toast({
        title: "Menu Item Removed",
        description: `${selectedMenuItem.name} has been removed from the menu.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedMenuItem(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove menu item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant menu items, pricing, and availability.
          </p>
        </div>
        <Button onClick={handleAddMenuItem} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="desktop-table">
        <div className="table-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Menu Items ({filteredItems.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Item</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Price</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Prep Time</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td>
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </td>
                  <td>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </td>
                  <td className="font-medium text-foreground">${item.price}</td>
                  <td className="text-muted-foreground">{item.prepTime} min</td>
                  <td>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMenuItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMenuItem(item)}
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
        {filteredItems.map((item) => (
          <Card key={item.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{item.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Price:</span> ${item.price}</p>
                <p><span className="font-medium">Prep Time:</span> {item.prepTime} min</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditMenuItem(item)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteMenuItem(item)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <MenuItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        menuItem={selectedMenuItem}
        mode={formMode}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Menu Item"
        description="Are you sure you want to remove"
        itemName={selectedMenuItem?.name}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default MenuManagementPage;