import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(50, "Name must be less than 50 characters"),
  slug: z.string().min(1, "Slug is required").max(50, "Slug must be less than 50 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface Location {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LocationFormData) => void;
  location?: Location;
  mode: "add" | "edit";
}

const LocationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  location,
  mode,
}: LocationFormModalProps) => {
  const { toast } = useToast();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  useEffect(() => {
    if (location && mode === "edit") {
      form.reset({
        name: location.name,
        slug: location.slug,
        description: location.description || "",
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
      });
    }
  }, [location, mode, form]);

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    if (mode === "add") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  const handleSubmit = async (data: LocationFormData) => {
    try {
      onSubmit(data);
      toast({
        title: mode === "add" ? "Location Added" : "Location Updated",
        description: `Location "${data.name}" has been ${mode === "add" ? "added" : "updated"} successfully.`,
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} location. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Location" : "Edit Location"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter the details for the new location/area."
              : "Update the location/area information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Ground Floor, First Floor, Outdoor"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., ground-floor"
                      {...field}
                      disabled={mode === "add"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the location..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {mode === "add" ? "Add Location" : "Update Location"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFormModal;
