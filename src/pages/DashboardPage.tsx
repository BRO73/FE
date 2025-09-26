import { 
  Users, 
  Table, 
  ChefHat, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Star
} from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  // Mock data for demonstration
  const metrics = [
    {
      title: "Total Tables",
      value: 24,
      change: "+2 this month",
      changeType: "positive" as const,
      icon: Table,
    },
    {
      title: "Active Staff",
      value: 18,
      change: "2 on leave",
      changeType: "neutral" as const,
      icon: Users,
    },
    {
      title: "Menu Items",
      value: 156,
      change: "+8 new dishes",
      changeType: "positive" as const,
      icon: ChefHat,
    },
    {
      title: "Today's Bookings",
      value: 42,
      change: "+15% vs yesterday",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Revenue Today",
      value: "$2,847",
      change: "+23% vs yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Avg Service Time",
      value: "18 min",
      change: "-2 min improvement",
      changeType: "positive" as const,
      icon: Clock,
    },
    {
      title: "Customer Rating",
      value: "4.8",
      change: "+0.2 this week",
      changeType: "positive" as const,
      icon: Star,
    },
    {
      title: "Growth Rate",
      value: "+12.5%",
      change: "vs last month",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const recentActivity = [
    { action: "New booking", details: "Table 5 - John Doe", time: "2 min ago" },
    { action: "Staff check-in", details: "Maria Garcia", time: "5 min ago" },
    { action: "Menu item updated", details: "Grilled Salmon", time: "12 min ago" },
    { action: "Payment completed", details: "Table 3 - $156.50", time: "18 min ago" },
    { action: "New feedback", details: "5 stars - Great service!", time: "25 min ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your restaurant today.
          </p>
        </div>
        <Button className="btn-primary">
          <TrendingUp className="w-4 h-4 mr-2" />
          View Full Reports
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Table className="w-6 h-6" />
              <span className="text-sm">Add Table</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Add Staff</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ChefHat className="w-6 h-6" />
              <span className="text-sm">Add Menu Item</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">New Booking</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;