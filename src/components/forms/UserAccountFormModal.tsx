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

const userAccountSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "staff", "viewer"]),
});

type UserAccountFormData = z.infer<typeof userAccountSchema>;

export interface UserAccount {
  id: number;
  name: string;
  role: "admin" | "manager" | "staff" | "viewer";
  createdAt: string;
}

interface UserAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserAccountFormData) => void;
  userAccount?: UserAccount;
  mode: "add" | "edit";
}

const UserAccountFormModal = ({ isOpen, onClose, onSubmit, userAccount, mode }: UserAccountFormModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      name: "",
      password: "",
      role: "staff",
    },
  });

  useEffect(() => {
    if (userAccount && mode === "edit") {
      form.setValue("name", userAccount.name);
      form.setValue("role", userAccount.role);
      form.setValue("password", "");
    } else if (mode === "add") {
      form.reset({
        name: "",
        password: "",
        role: "staff",
      });
    }
  }, [userAccount, mode, form]);

  const handleSubmit = async (data: UserAccountFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
      toast({
        title: mode === "add" ? "User Account Created" : "User Account Updated",
        description: `Account for ${data.name} has been ${mode === "add" ? "created" : "updated"} successfully.`,
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
          <DialogTitle>
            {mode === "add" ? "Create New User Account" : "Edit User Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Create a new user account for system access."
              : "Update the user account information. Leave password blank to keep current password."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mode === "add" ? "Password" : "New Password (optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={mode === "add" ? "Enter password" : "Leave blank to keep current"}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
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
                {isSubmitting ? "Saving..." : mode === "add" ? "Create Account" : "Update Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserAccountFormModal;
