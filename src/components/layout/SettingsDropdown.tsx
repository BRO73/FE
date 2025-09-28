import { Settings, Palette, Globe, Shield, Bell, HelpCircle, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "../theme-provider";

const SettingsDropdown = () => {
  const { theme, setTheme } = useTheme();

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
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="w-4 h-4 mr-2" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="w-4 h-4 mr-2" />
              <span>Light</span>
              {theme === "light" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="w-4 h-4 mr-2" />
              <span>Dark</span>
              {theme === "dark" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="w-4 h-4 mr-2" />
              <span>System</span>
              {theme === "system" && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
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