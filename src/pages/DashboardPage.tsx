import { 
  Users, 
  Table, 
  ChefHat, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  Percent
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MetricCard from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getAllMenuItems
} from "@/api/menuItem.api.ts"
import {
  MenuItem
} from "@/types/type.ts"
import { useState } from "react";
const DashboardPage = () => {
  const navigate = useNavigate();
  const [menuItems,setMenuItems] = useState()
  // Mock data for demonstration
  const metrics = [
    {
      title: "Total Tables",
      value: 24,
      change: "+2 this month",
      changeType: "positive" as const,
      icon: Table,
      link: "/admin/tables",
    },
    {
      title: "Active Staff",
      value: 18,
      change: "2 on leave",
      changeType: "neutral" as const,
      icon: Users,
      link: "/admin/staff",
    },
    {
      title: "Menu Items",
      value: 156,
      change: "+8 new dishes",
      changeType: "positive" as const,
      icon: ChefHat,
      link: "/admin/menu",
    },
    {
      title: "Today's Bookings",
      value: 42,
      change: "+15% vs yesterday",
      changeType: "positive" as const,
      icon: Calendar,
      link: "/admin/bookings",
    },
    {
      title: "Revenue Today",
      value: "$2,847",
      change: "+23% vs yesterday",
      changeType: "positive" as const,
      icon: DollarSign,
      link: "/admin/transactions",
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
      link: "/admin/feedback",
    },
    {
      title: "Growth Rate",
      value: "+12.5%",
      change: "vs last month",
      changeType: "positive" as const,
      icon: TrendingUp,
      link: "/admin/reports",
    },
  ];

  const recentActivity = [
    { action: "New booking", details: "Table 5 - John Doe", time: "2 min ago", link: "/admin/bookings" },
    { action: "Staff check-in", details: "Maria Garcia", time: "5 min ago", link: "/admin/staff" },
    { action: "Menu item updated", details: "Grilled Salmon", time: "12 min ago", link: "/admin/menu" },
    { action: "Payment completed", details: "Table 3 - $156.50", time: "18 min ago", link: "/admin/transactions" },
    { action: "New feedback", details: "5 stars - Great service!", time: "25 min ago", link: "/admin/feedback" },
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
        <Button className="btn-primary" asChild>
          <Link to="/admin/reports">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Full Reports
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          if (metric.link) {
            return (
              <Link key={index} to={metric.link} className="block group">
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changeType={metric.changeType}
                  icon={metric.icon}
                  className="transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg cursor-pointer"
                />
              </Link>
            );
          }
          
          return (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
            />
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/reports">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <Link 
                key={index} 
                to={activity.link}
                className="flex items-center justify-between py-2 rounded-md hover:bg-muted/50 px-2 -mx-2 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/tables')}
            >
              <Table className="w-6 h-6" />
              <span className="text-sm">Manage Tables</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/staff')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Staff</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/menu')}
            >
              <ChefHat className="w-6 h-6" />
              <span className="text-sm">Manage Menu</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/bookings')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Manage Bookings</span>
            </Button>
          </div>
          
          {/* Additional Quick Actions Row */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/promotions')}
            >
              <Percent className="w-6 h-6" />
              <span className="text-sm">Promotions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/admin/feedback')}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">Feedback</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;