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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TableFormData, TableResponse } from "@/types/type";

/** Schema đúng shape FE/BE: "available" | "occupied" | "reserved" | "maintenance" */
const tableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required").max(10, "Too long"),
  capacity: z.coerce.number().min(1, "At least 1 seat").max(20, "Maximum 20 seats"),
  locationId: z.coerce.number().min(1, "Location is required"),
  status: z.enum(["available", "occupied", "reserved", "maintenance"]),
});

type FormInput = z.input<typeof tableSchema>;   // input cho form (cho phép coerce)
type FormOutput = z.output<typeof tableSchema>; // output sau validate (đúng kiểu cuối)

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TableFormData) => void;
  table?: TableResponse;
  mode: "add" | "edit";
}

const TableFormModal = ({ isOpen, onClose, onSubmit, table, mode }: TableFormModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khai báo form theo FormInput để hỗ trợ coerce string->number
  const form = useForm<FormInput>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: "",
      capacity: 4,
      locationId: 0,
      status: "available",
    },
  });

  useEffect(() => {
    if (table && mode === "edit") {
      form.setValue("tableNumber", table.tableNumber);
      form.setValue("capacity", table.capacity);
      form.setValue("locationId", table.locationId);
      form.setValue("status", table.status);
    } else if (mode === "add") {
      form.reset({
        tableNumber: "",
        capacity: 4,
        locationId: 0,
        status: "available",
      });
    }
  }, [table, mode, form]);

  const handleSubmit = async (raw: FormInput) => {
    setIsSubmitting(true);
    try {
      // Parse qua schema để chắc chắn output đã là number, enum đúng
      const data: FormOutput = tableSchema.parse(raw);
      onSubmit(data as TableFormData);

      toast({
        title: mode === "add" ? "Table Created" : "Table Updated",
        description: `Table ${data.tableNumber} has been ${mode === "add" ? "created" : "updated"} successfully.`,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Table" : "Edit Table"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new table for your restaurant."
              : "Update the table information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Table Number */}
            <FormField
              control={form.control}
              name="tableNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Number</FormLabel>
                  <FormControl>
                    <Input placeholder="T01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Seats</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location ID */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter location id" {...field} />
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
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Saving..." : mode === "add" ? "Create Table" : "Update Table"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TableFormModal;
