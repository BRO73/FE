import { Menu, Search, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Topbar = ({ onToggleSidebar, sidebarCollapsed }: TopbarProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hidden lg:flex"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 bg-muted/50 border-0 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          
          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* Profile */}
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:block text-sm font-medium">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;