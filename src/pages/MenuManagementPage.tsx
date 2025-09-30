import {useEffect, useState} from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MenuItemFormModal from "@/components/forms/MenuItemFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";
import MenuItemViewCard from "@/components/ui/MenuItemViewCard";
import CategoryFormModal, { Category } from "@/components/forms/CategoryFormModal";


import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/services/menuItemService";

import {
  fetchCategories
} from "@/services/categoryService.ts"
import {CategoryResponse} from "@/types/type";
import { MenuItemFormData,MenuItemResponse } from "@/types/type";
import {deleteMenuItemApi, postMenuItem, putMenuItem} from "@/api/menuItemApi.ts";

const MenuManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemResponse | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]); // default "all"

  useEffect(() => {
    getAllMenuItems()
        .then((data) => {
          console.log("Fetched menu items:", data); // full backend data
          setMenuItems(data); // lưu nguyên categoryName từ backend
        })
        .catch(() =>
            toast({
              title: "Error",
              description: "Failed to load menu items",
              variant: "destructive",
            })
        );
  }, []);



  // Fetch categories từ backend
  useEffect(() => {
    fetchCategories()
        .then((res) => {
          const categoryNames = res.data.map((cat: CategoryResponse) => cat.name);
          setCategories(["all", ...categoryNames]);
        })
        .catch(() =>
            toast({
              title: "Error",
              description: "Failed to load categories",
              variant: "destructive",
            })
        );
  }, []);



  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
        (item.categoryName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
        selectedCategory === "all" ||
        (item.categoryName ?? "").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });


  const getCategoryColor   = (category?: MenuItemResponse["categoryName"]) => {
    if (!category) return "bg-muted text-muted-foreground"; // fallback
    switch (category.toLowerCase()) {
      case "appetizer": return "bg-emerald-500 text-white";
      case "main": return "bg-blue-500 text-white";
      case "dessert": return "bg-pink-500 text-white";
      case "beverage": return "bg-amber-500 text-white";
      case "special": return "bg-purple-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: MenuItemResponse["status"]) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-success text-success-foreground";
      case "unavailable":
        return "bg-destructive text-destructive-foreground";
      case "seasonal":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };


  const handleAddMenuItem = () => {
    setFormMode("add");
    setSelectedMenuItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditMenuItem = (item: MenuItemResponse) => {
    setFormMode("edit");
    setSelectedMenuItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteMenuItemClick = (item: MenuItemResponse) => {
    setSelectedMenuItem(item);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteMenuItem = (item: MenuItemResponse) => {
    setSelectedMenuItem(item);
    setIsDeleteDialogOpen(true);
  };


  const handleFormSubmit = async (data: Partial<MenuItemFormData>) => {
    setIsSubmitting(true);

    const payload = {
      name: data.name,
      categoryName: data.categoryName,
      description: data.description,
      price: Number(data.price),
      status: data.status,
      imageUrl: data.imageUrl || null
    };

    try {
      if (formMode === "add") {
        const response = await postMenuItem(payload);
        const newItem = response.data;
        console.log("Backend response:", response.data);
        // ✅ đảm bảo luôn có categoryName
        const normalizedItem = { ...newItem, categoryName: newItem.categoryName ?? "Unknown" };
        setMenuItems([...menuItems, normalizedItem]);
        console.log("Updated menuItems state:", [...menuItems, response.data]);
      } else if (formMode === "edit" && selectedMenuItem) {
        const response = await putMenuItem(selectedMenuItem.id, payload);
        console.log("Backend response:", response.data);
        const updatedItem = response.data;
        const normalizedItem = { ...updatedItem, categoryName: updatedItem.categoryName ?? "Unknown" };
        setMenuItems(menuItems.map((m) => (m.id === selectedMenuItem.id ? normalizedItem : m)));
        console.log("Updated menuItems state:", [...menuItems, response.data]);
      }

      setIsFormModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


// ✅ Gọi API khi delete
  const handleDeleteConfirm = async () => {
    if (!selectedMenuItem) return;

    setIsSubmitting(true);
    try {
      // ✅ Gọi API xóa menu item
      await deleteMenuItemApi(selectedMenuItem.id);

      // ✅ Update state frontend
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
          <table className="w-full table-auto">
            <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Item</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Category</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Price</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Image Url</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-4 text-left">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Badge className={getCategoryColor(item.categoryName ?? "unknown")}>
                      {item.categoryName ?? "Unknown"}
                    </Badge>
                  </td>
                  <td className="py-2 px-4 text-center font-medium text-foreground">${item.price}</td>
                  <td className="py-2 px-4 text-center font-medium text-foreground">{item.imageUrl}</td>
                  <td className="py-2 px-4 text-center">
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditMenuItem(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteMenuItem(item)}>
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
                <Badge className={getCategoryColor(item.categoryName)}>
                  {item.categoryName}
                </Badge>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1 text-muted-foreground">
                <p><span className="font-medium">Price:</span> ${item.price}</p>
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