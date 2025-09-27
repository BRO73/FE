import { useState } from "react";
import { Plus, Edit, X, Search, Calendar, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BookingFormModal from "@/components/forms/BookingFormModal";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";

interface Booking {
  id: number;
  customerName: string;
  phone: string;
  email?: string;
  tableNumber: string;
  date: string;
  time: string;
  partySize: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  specialRequests?: string;
}

const BookingManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, customerName: "Alice Johnson", phone: "+1 234-567-8901", email: "alice@email.com", tableNumber: "T03", date: "2024-03-15", time: "19:00", partySize: 4, status: "confirmed", specialRequests: "Birthday celebration" },
    { id: 2, customerName: "Bob Smith", phone: "+1 234-567-8902", tableNumber: "T01", date: "2024-03-15", time: "18:30", partySize: 2, status: "confirmed" },
    { id: 3, customerName: "Carol Davis", phone: "+1 234-567-8903", email: "carol@email.com", tableNumber: "T05", date: "2024-03-15", time: "20:00", partySize: 6, status: "pending", specialRequests: "Vegetarian options needed" },
    { id: 4, customerName: "David Wilson", phone: "+1 234-567-8904", tableNumber: "T02", date: "2024-03-14", time: "19:30", partySize: 3, status: "completed" },
    { id: 5, customerName: "Eva Brown", phone: "+1 234-567-8905", tableNumber: "T04", date: "2024-03-16", time: "18:00", partySize: 2, status: "cancelled" },
    { id: 6, customerName: "Frank Miller", phone: "+1 234-567-8906", email: "frank@email.com", tableNumber: "T06", date: "2024-03-16", time: "19:15", partySize: 4, status: "confirmed", specialRequests: "Anniversary dinner" },
  ]);

  const statuses = ["all", "confirmed", "pending", "cancelled", "completed"];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.phone.includes(searchTerm) ||
                         booking.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleAddBooking = () => {
    setFormMode("add");
    setSelectedBooking(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setFormMode("edit");
    setSelectedBooking(booking);
    setIsFormModalOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (formMode === "add") {
      const newBooking: Booking = {
        id: Math.max(...bookings.map(b => b.id)) + 1,
        ...data,
      };
      setBookings([...bookings, newBooking]);
    } else if (formMode === "edit" && selectedBooking) {
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...selectedBooking, ...data } : b
      ));
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;
    
    setIsSubmitting(true);
    try {
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: "cancelled" } : b
      ));
      toast({
        title: "Booking Cancelled",
        description: `${selectedBooking.customerName}'s booking has been cancelled.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedBooking(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
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
          <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage restaurant reservations and table bookings.
          </p>
        </div>
        <Button onClick={handleAddBooking} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, phone, or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="desktop-table">
        <div className="table-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Bookings ({filteredBookings.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Table</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Party Size</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="table-row">
                  <td>
                    <div>
                      <div className="font-medium text-foreground">{booking.customerName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {booking.phone}
                      </div>
                      {booking.specialRequests && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Note: {booking.specialRequests}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="font-medium text-foreground">{booking.tableNumber}</td>
                  <td className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.time}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{booking.partySize} guests</td>
                  <td>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        <X className="w-4 h-4" />
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
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{booking.customerName}</h4>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {booking.phone}
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Table:</span> {booking.tableNumber}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{booking.time}</span>
                </div>
              </div>
              <p><span className="font-medium">Party Size:</span> {booking.partySize} guests</p>
              {booking.specialRequests && (
                <p><span className="font-medium">Note:</span> {booking.specialRequests}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditBooking(booking)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelBooking(booking)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <BookingFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        booking={selectedBooking}
        mode={formMode}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Booking"
        description="Are you sure you want to cancel the booking for"
        itemName={selectedBooking?.customerName}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default BookingManagementPage;