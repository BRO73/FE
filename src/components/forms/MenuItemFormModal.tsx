import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {fetchCategories} from "@/api/category.api.ts";
import {CategoryResponse, MenuItemFormData} from "@/types/type.ts";



// ✅ Props cho modal
interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => void | Promise<void>;
  menuItem?: MenuItemFormData; // chỉ dùng form data thôi
  mode: "add" | "edit";
}

const MenuItemFormModal = ({

                             isOpen,
                             onClose,
                             onSubmit,
                             menuItem,
                             mode,
                           }: MenuItemFormModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

// Trong defaultValues và reset
    const form = useForm<MenuItemFormData>({
        defaultValues: {
            name: "",
            categoryName: "All",
            price: 0,
            description: "",
            status: "available",
            imageUrl: "", // ✅ thêm default cho image
        },
    });

    useEffect(() => {
        if (menuItem && mode === "edit") {
            form.reset(menuItem);
        } else if (mode === "add") {
            form.reset({
                name: "",
                categoryName: categories[0] || "all",
                price: 0,
                description: "",
                status: "available",
                imageUrl: "", // ✅ reset image
            });
        }
    }, [menuItem, mode, categories]);


    useEffect(() => {
        fetchCategories()
            .then((res) => {
                const categoryNames = res.data.map((cat: CategoryResponse) => cat.name);
                setCategories(["all", ...categoryNames]);

                // ✅ reset categoryName về giá trị hợp lệ
                form.setValue("categoryName", categoryNames[0] || "all");
            })
            .catch(() =>
                toast({
                    title: "Error",
                    description: "Failed to load categories",
                    variant: "destructive",
                })
            );
    }, []);


    useEffect(() => {
    if (menuItem && mode === "edit") {
      form.reset(menuItem); // ✅ load lại form data từ props
    } else if (mode === "add") {
      form.reset({
        name: "",
        categoryName: categories[0],
        price: 0,
        description: "",
        status: "available",
      });
    }
  }, [menuItem, mode, form]);

  const handleSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);

      toast({
        title: mode === "add" ? "Menu Item Added" : "Menu Item Updated",
        description: `${data.name} has been ${mode === "add" ? "added to" : "updated in"} the menu.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add New Menu Item" : "Edit Menu Item"}</DialogTitle>
            <DialogDescription>
              {mode === "add"
                  ? "Add a new item to your restaurant menu."
                  : "Update the menu item information."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Grilled Salmon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Category */}
              <FormField
                  control={form.control}
                  name="categoryName"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <Select onValueChange={field.onChange} value={field.value || "all"}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {categories.map((category) => (
                                          <SelectItem key={category} value={category}>
                                              {category.charAt(0).toUpperCase() + category.slice(1)}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>

                              <SelectContent>
                                  {categories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                          {category.charAt(0).toUpperCase() + category.slice(1)} {/* Optional: capitalize */}
                                      </SelectItem>
                                  ))}
                              </SelectContent>

                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Description */}
              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                              placeholder="Describe the dish, ingredients, and preparation method..."
                              rows={3}
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Price */}
              <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="19.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              {/* Status */}
              <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="unavailable">Unavailable</SelectItem>
                              <SelectItem value="seasonal">Seasonal</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
                {/* Image URL */}
                {/* Image URL */}
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                      ? "Saving..."
                      : mode === "add"
                          ? "Add Item"
                          : "Update Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
};

export default MenuItemFormModal;
