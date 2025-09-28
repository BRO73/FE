import { Settings, Palette, Globe, Shield, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const SettingsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Palette className="w-4 h-4 mr-2" />
          <span>Appearance</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              <span>Notifications</span>
            </div>
            <Switch defaultChecked />
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Globe className="w-4 h-4 mr-2" />
          <span>Language</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Shield className="w-4 h-4 mr-2" />
          <span>Privacy & Security</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <HelpCircle className="w-4 h-4 mr-2" />
          <span>Help & Support</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;