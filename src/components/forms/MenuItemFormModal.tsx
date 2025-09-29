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

// ✅ Form schema (không có prepTime)
const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  category: z.enum(["appetizer", "main", "dessert", "beverage", "special"]),
  price: z.coerce.number().min(0.01, "Price must be greater than 0").max(999.99, "Price too high"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  status: z.enum(["available", "unavailable", "seasonal"]),
});

// ✅ Type form data
export type MenuItemFormData = z.infer<typeof menuItemSchema>;

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

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      category: "main",
      price: 0,
      description: "",
      status: "available",
    },
  });

  useEffect(() => {
    if (menuItem && mode === "edit") {
      form.reset(menuItem); // ✅ load lại form data từ props
    } else if (mode === "add") {
      form.reset({
        name: "",
        category: "main",
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
                  name="category"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="appetizer">Appetizer</SelectItem>
                              <SelectItem value="main">Main Course</SelectItem>
                              <SelectItem value="dessert">Dessert</SelectItem>
                              <SelectItem value="beverage">Beverage</SelectItem>
                              <SelectItem value="special">Special</SelectItem>
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
