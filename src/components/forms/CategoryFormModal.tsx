import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SketchPicker, ColorResult } from "react-color";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ✅ Schema for CategoryForm
const categorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
    description: z.string().max(200, "Description too long").optional(),
    // vẫn giữ imageUrl làm field, nhưng value là hex color
    imageUrl: z
        .string()
        .regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color")
        .optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string; // value sẽ là color hex
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    category?: Category;
    mode: "add" | "edit";
}

const CategoryFormModal = ({
                               isOpen,
                               onClose,
                               onSubmit,
                               category,
                               mode,
                           }: CategoryFormModalProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            imageUrl: "#000000",
        },
    });

    // Khi edit, set giá trị form
    useEffect(() => {
        if (category && mode === "edit") {
            form.setValue("name", category.name);
            form.setValue("description", category.description || "");
            form.setValue("imageUrl", category.imageUrl || "#000000");
        } else if (mode === "add") {
            form.reset({
                name: "",
                description: "",
                imageUrl: "#000000",
            });
        }
    }, [category, mode, form]);

    const handleSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            onSubmit(data);
            toast({
                title: mode === "add" ? "Category Added" : "Category Updated",
                description: `${data.name} has been ${mode === "add" ? "added" : "updated"}.`,
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add" ? "Add New Category" : "Edit Category"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "add"
                            ? "Create a new menu category."
                            : "Update the category information."}
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
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main Course" {...field} />
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
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Brief description of the category..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Color Picker (lưu vào imageUrl) */}
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <div>
                                            {/* Preview màu */}
                                            <div className="flex items-center gap-4 mb-2">
                                                <div
                                                    className="w-10 h-10 rounded border"
                                                    style={{ backgroundColor: field.value }}
                                                />
                                                <span>{field.value}</span>
                                            </div>

                                            {/* Button mở picker */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowPicker((prev) => !prev)}
                                            >
                                                Choose Color
                                            </Button>

                                            {/* SketchPicker */}
                                            {showPicker && (
                                                <div className="mt-2">
                                                    <SketchPicker
                                                        color={field.value || "#000000"}
                                                        onChange={(updatedColor: ColorResult) =>
                                                            field.onChange(updatedColor.hex)
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        className="mt-2"
                                                        onClick={() => setShowPicker(false)}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Footer */}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Saving..."
                                    : mode === "add"
                                        ? "Add Category"
                                        : "Update Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryFormModal;
