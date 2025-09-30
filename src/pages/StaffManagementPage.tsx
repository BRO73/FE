import { useState } from "react";
import { Plus, Edit, Trash2, Search, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import StaffFormModal from "@/components/forms/StaffFormModal";
import UserAccountFormModal, { UserAccount } from "@/components/forms/UserAccountFormModal";
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

  // User account states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [isUserDeleteDialogOpen, setIsUserDeleteDialogOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState<"add" | "edit">("add");
  const [selectedUserAccount, setSelectedUserAccount] = useState<UserAccount | undefined>();

  // Mock data - Staff
  const [staff, setStaff] = useState<Staff[]>([
    { id: 1, name: "John Smith", role: "manager", email: "john@restaurant.com", phone: "+1 234-567-8901", status: "active", joinDate: "2023-01-15" },
    { id: 2, name: "Maria Garcia", role: "waiter", email: "maria@restaurant.com", phone: "+1 234-567-8902", status: "active", joinDate: "2023-03-20" },
    { id: 3, name: "David Chen", role: "chef", email: "david@restaurant.com", phone: "+1 234-567-8903", status: "active", joinDate: "2023-02-10" },
    { id: 4, name: "Sarah Johnson", role: "waiter", email: "sarah@restaurant.com", phone: "+1 234-567-8904", status: "on-leave", joinDate: "2023-04-05" },
    { id: 5, name: "Mike Wilson", role: "cashier", email: "mike@restaurant.com", phone: "+1 234-567-8905", status: "active", joinDate: "2023-05-12" },
    { id: 6, name: "Lisa Brown", role: "cleaner", email: "lisa@restaurant.com", phone: "+1 234-567-8906", status: "inactive", joinDate: "2023-01-30" },
  ]);

  // Mock data - User Accounts
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([
    { id: 1, name: "admin", role: "admin", createdAt: "2023-01-01" },
    { id: 2, name: "manager1", role: "manager", createdAt: "2023-02-15" },
    { id: 3, name: "staff1", role: "staff", createdAt: "2023-03-20" },
    { id: 4, name: "viewer1", role: "viewer", createdAt: "2023-04-10" },
  ]);

  const filteredStaff = staff.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserAccounts = userAccounts.filter(account =>
      account.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      account.role.toLowerCase().includes(userSearchTerm.toLowerCase())
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

  const getUserRoleColor = (role: UserAccount["role"]) => {
    switch (role) {
      case "admin": return "bg-destructive text-destructive-foreground";
      case "manager": return "bg-primary text-primary-foreground";
      case "staff": return "bg-blue-500 text-white";
      case "viewer": return "bg-muted text-muted-foreground";
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

  // User Account Handlers
  const handleAddUserAccount = () => {
    setUserFormMode("add");
    setSelectedUserAccount(undefined);
    setIsUserFormModalOpen(true);
  };

  const handleEditUserAccount = (account: UserAccount) => {
    setUserFormMode("edit");
    setSelectedUserAccount(account);
    setIsUserFormModalOpen(true);
  };

  const handleDeleteUserAccount = (account: UserAccount) => {
    setSelectedUserAccount(account);
    setIsUserDeleteDialogOpen(true);
  };

  const handleUserAccountFormSubmit = (data: any) => {
    if (userFormMode === "add") {
      const newAccount: UserAccount = {
        id: Math.max(...userAccounts.map(u => u.id)) + 1,
        name: data.name,
        role: data.role,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUserAccounts([...userAccounts, newAccount]);
    } else if (userFormMode === "edit" && selectedUserAccount) {
      setUserAccounts(userAccounts.map(u =>
          u.id === selectedUserAccount.id ? { ...selectedUserAccount, name: data.name, role: data.role } : u
      ));
    }
    setIsUserFormModalOpen(false);
  };

  const handleUserAccountDeleteConfirm = async () => {
    if (!selectedUserAccount) return;

    setIsSubmitting(true);
    try {
      setUserAccounts(userAccounts.filter(u => u.id !== selectedUserAccount.id));
      toast({
        title: "User Account Deleted",
        description: `Account ${selectedUserAccount.name} has been deleted.`,
      });
      setIsUserDeleteDialogOpen(false);
      setSelectedUserAccount(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user account. Please try again.",
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
              Manage restaurant staff members and user account access.
            </p>
          </div>
        </div>

        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
            <TabsTrigger value="accounts">User Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleAddStaff} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add New Staff
              </Button>
            </div>

            {/* Search */}
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
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleAddUserAccount} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create User Account
              </Button>
            </div>

            {/* Search */}
            <Card className="dashboard-card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                      placeholder="Search accounts by username or role..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                  />
                </div>
              </div>
            </Card>

            {/* Desktop Table View */}
            <Card className="desktop-table">
              <div className="table-header flex items-center justify-between">
                <h3 className="text-lg font-semibold">All User Accounts ({filteredUserAccounts.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Username</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Created Date</th>
                    <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredUserAccounts.map((account) => (
                      <tr key={account.id} className="table-row">
                        <td className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {account.name}
                          </div>
                        </td>
                        <td>
                          <Badge className={getUserRoleColor(account.role)}>
                            {account.role}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground">{account.createdAt}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUserAccount(account)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUserAccount(account)}
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
              {filteredUserAccounts.map((account) => (
                  <Card key={account.id} className="mobile-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <h4 className="font-semibold text-foreground">{account.name}</h4>
                      </div>
                      <Badge className={getUserRoleColor(account.role)}>
                        {account.role}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium">Created:</span> {account.createdAt}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUserAccount(account)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUserAccount(account)}
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

        <StaffFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            staff={selectedStaff}
            mode={formMode}
        />

        <UserAccountFormModal
            isOpen={isUserFormModalOpen}
            onClose={() => setIsUserFormModalOpen(false)}
            onSubmit={handleUserAccountFormSubmit}
            userAccount={selectedUserAccount}
            mode={userFormMode}
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

        <DeleteConfirmDialog
            isOpen={isUserDeleteDialogOpen}
            onClose={() => setIsUserDeleteDialogOpen(false)}
            onConfirm={handleUserAccountDeleteConfirm}
            title="Delete User Account"
            description="Are you sure you want to delete the account"
            itemName={selectedUserAccount?.name}
            isLoading={isSubmitting}
        />
      </div>
  );
};

export default StaffManagementPage;