import { useState } from "react";
import { Plus, Edit, Trash2, Search, Calendar, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired" | "scheduled";
  usageCount: number;
  maxUsage?: number;
  code?: string;
}

const PromotionPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data
  const [promotions] = useState<Promotion[]>([
    { id: 1, title: "Weekend Special", description: "20% off all main courses during weekends", discountType: "percentage", discountValue: 20, startDate: "2024-03-01", endDate: "2024-03-31", status: "active", usageCount: 45, maxUsage: 100, code: "WEEKEND20" },
    { id: 2, title: "Happy Hour", description: "$5 off all beverages from 5-7 PM", discountType: "fixed", discountValue: 5, startDate: "2024-03-01", endDate: "2024-03-31", status: "active", usageCount: 128, code: "HAPPY5" },
    { id: 3, title: "First Timer", description: "15% discount for new customers", discountType: "percentage", discountValue: 15, startDate: "2024-02-01", endDate: "2024-12-31", status: "active", usageCount: 67, code: "FIRSTTIME15" },
    { id: 4, title: "Valentine's Special", description: "Buy one get one free dessert", discountType: "percentage", discountValue: 50, startDate: "2024-02-10", endDate: "2024-02-14", status: "expired", usageCount: 89, maxUsage: 50, code: "VALENTINE" },
    { id: 5, title: "Summer Launch", description: "25% off summer menu items", discountType: "percentage", discountValue: 25, startDate: "2024-06-01", endDate: "2024-08-31", status: "scheduled", usageCount: 0, maxUsage: 200, code: "SUMMER25" },
    { id: 6, title: "Student Discount", description: "$10 off orders above $50 for students", discountType: "fixed", discountValue: 10, startDate: "2024-01-01", endDate: "2024-12-31", status: "inactive", usageCount: 23, code: "STUDENT10" },
  ]);

  const statuses = ["all", "active", "inactive", "expired", "scheduled"];

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || promotion.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Promotion["status"]) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      case "scheduled": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDiscount = (type: Promotion["discountType"], value: number) => {
    return type === "percentage" ? `${value}%` : `$${value}`;
  };

  const handleAddPromotion = () => {
    toast({
      title: "Add Promotion",
      description: "Promotion creation form would open here",
    });
  };

  const handleEditPromotion = (promotion: Promotion) => {
    toast({
      title: "Edit Promotion",
      description: `Edit form for ${promotion.title} would open here`,
    });
  };

  const handleDeletePromotion = (promotion: Promotion) => {
    toast({
      title: "Delete Promotion",
      description: `Confirmation dialog for removing ${promotion.title} would appear here`,
      variant: "destructive",
    });
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promotion Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotional campaigns and discount codes.
          </p>
        </div>
        <Button onClick={handleAddPromotion} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Promotions</p>
              <p className="text-2xl font-bold text-foreground">
                {promotions.filter(p => p.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
              <p className="text-2xl font-bold text-foreground">
                {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-foreground">
                {promotions.filter(p => p.status === "scheduled").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-foreground">
                {promotions.filter(p => isExpiringSoon(p.endDate)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions by title, description, or code..."
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
          <h3 className="text-lg font-semibold">All Promotions ({filteredPromotions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Promotion</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Discount</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Duration</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Usage</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map((promotion) => (
                <tr key={promotion.id} className="table-row">
                  <td>
                    <div>
                      <div className="font-medium text-foreground">{promotion.title}</div>
                      <div className="text-sm text-muted-foreground">{promotion.description}</div>
                      {promotion.code && (
                        <div className="text-xs text-primary font-mono mt-1">Code: {promotion.code}</div>
                      )}
                    </div>
                  </td>
                  <td className="font-medium text-foreground">
                    {formatDiscount(promotion.discountType, promotion.discountValue)} off
                  </td>
                  <td className="text-muted-foreground">
                    <div className="text-sm">
                      <div>{promotion.startDate}</div>
                      <div className="text-xs">to {promotion.endDate}</div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">
                    {promotion.usageCount}
                    {promotion.maxUsage && ` / ${promotion.maxUsage}`}
                  </td>
                  <td>
                    <Badge className={getStatusColor(promotion.status)}>
                      {promotion.status}
                    </Badge>
                    {isExpiringSoon(promotion.endDate) && promotion.status === "active" && (
                      <Badge className="ml-2 bg-warning text-warning-foreground">
                        Expiring Soon
                      </Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPromotion(promotion)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePromotion(promotion)}
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
        {filteredPromotions.map((promotion) => (
          <Card key={promotion.id} className="mobile-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{promotion.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{promotion.description}</p>
                {promotion.code && (
                  <p className="text-xs text-primary font-mono mt-1">Code: {promotion.code}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={getStatusColor(promotion.status)}>
                  {promotion.status}
                </Badge>
                {isExpiringSoon(promotion.endDate) && promotion.status === "active" && (
                  <Badge className="bg-warning text-warning-foreground">
                    Expiring Soon
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Discount:</span> {formatDiscount(promotion.discountType, promotion.discountValue)} off</p>
              <p><span className="font-medium">Duration:</span> {promotion.startDate} to {promotion.endDate}</p>
              <p><span className="font-medium">Usage:</span> {promotion.usageCount}{promotion.maxUsage && ` / ${promotion.maxUsage}`}</p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPromotion(promotion)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePromotion(promotion)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromotionPage;