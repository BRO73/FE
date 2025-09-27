import { useState } from "react";
import { Plus, Edit, Trash2, Search, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import StaffFormModal from "@/components/forms/StaffFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";

interface Staff {
  id: number;
  name: string;
  role: "manager" | "waiter" | "chef" | "cleaner" | "cashier";
  email: string;
  phone: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
}

const StaffManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const [staff, setStaff] = useState<Staff[]>([
    { id: 1, name: "John Smith", role: "manager", email: "john@restaurant.com", phone: "+1 234-567-8901", status: "active", joinDate: "2023-01-15" },
    { id: 2, name: "Maria Garcia", role: "waiter", email: "maria@restaurant.com", phone: "+1 234-567-8902", status: "active", joinDate: "2023-03-20" },
    { id: 3, name: "David Chen", role: "chef", email: "david@restaurant.com", phone: "+1 234-567-8903", status: "active", joinDate: "2023-02-10" },
    { id: 4, name: "Sarah Johnson", role: "waiter", email: "sarah@restaurant.com", phone: "+1 234-567-8904", status: "on-leave", joinDate: "2023-04-05" },
    { id: 5, name: "Mike Wilson", role: "cashier", email: "mike@restaurant.com", phone: "+1 234-567-8905", status: "active", joinDate: "2023-05-12" },
    { id: 6, name: "Lisa Brown", role: "cleaner", email: "lisa@restaurant.com", phone: "+1 234-567-8906", status: "inactive", joinDate: "2023-01-30" },
  ]);

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Staff["status"]) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "on-leave": return "bg-warning text-warning-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleColor = (role: Staff["role"]) => {
    switch (role) {
      case "manager": return "bg-primary text-primary-foreground";
      case "chef": return "bg-orange-500 text-white";
      case "waiter": return "bg-blue-500 text-white";
      case "cashier": return "bg-emerald-500 text-white";
      case "cleaner": return "bg-gray-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddStaff = () => {
    setFormMode("add");
    setSelectedStaff(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditStaff = (member: Staff) => {
    setFormMode("edit");
    setSelectedStaff(member);
    setIsFormModalOpen(true);
  };

  const handleDeleteStaff = (member: Staff) => {
    setSelectedStaff(member);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (formMode === "add") {
      const newStaff: Staff = {
        id: Math.max(...staff.map(s => s.id)) + 1,
        ...data,
      };
      setStaff([...staff, newStaff]);
    } else if (formMode === "edit" && selectedStaff) {
      setStaff(staff.map(s => 
        s.id === selectedStaff.id ? { ...selectedStaff, ...data } : s
      ));
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    
    setIsSubmitting(true);
    try {
      setStaff(staff.filter(s => s.id !== selectedStaff.id));
      toast({
        title: "Staff Member Removed",
        description: `${selectedStaff.name} has been removed from the team.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedStaff(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff member. Please try again.",
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
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant staff members, roles, and employment status.
          </p>
        </div>
        <Button onClick={handleAddStaff} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, role, or email..."
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
          <h3 className="text-lg font-semibold">All Staff ({filteredStaff.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Join Date</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id} className="table-row">
                  <td className="font-medium text-foreground">{member.name}</td>
                  <td>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{member.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status.replace("-", " ")}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">{member.joinDate}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStaff(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStaff(member)}
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
        {filteredStaff.map((member) => (
          <Card key={member.id} className="mobile-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">{member.name}</h4>
              <div className="flex gap-2">
                <Badge className={getRoleColor(member.role)}>
                  {member.role}
                </Badge>
                <Badge className={getStatusColor(member.status)}>
                  {member.status.replace("-", " ")}
                </Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
              <p><span className="font-medium">Joined:</span> {member.joinDate}</p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStaff(member)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteStaff(member)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        staff={selectedStaff}
        mode={formMode}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Staff Member"
        description="Are you sure you want to remove"
        itemName={selectedStaff?.name}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default StaffManagementPage;