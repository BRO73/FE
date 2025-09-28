import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Booking",
    message: "Table 5 booked for 7:30 PM by John Doe",
    time: "2 min ago",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "Low Stock Alert",
    message: "Grilled Salmon is running low in inventory",
    time: "15 min ago",
    type: "warning",
    read: false,
  },
  {
    id: "3",
    title: "Staff Clock-in",
    message: "Sarah Johnson has clocked in for evening shift",
    time: "1 hour ago",
    type: "success",
    read: true,
  },
  {
    id: "4",
    title: "Payment Received",
    message: "Payment of $145.50 received for Table 3",
    time: "2 hours ago",
    type: "success",
    read: true,
  },
];

const NotificationDropdown = () => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 min-w-[20px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {mockNotifications.length > 0 ? (
            <div className="p-1">
              {mockNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start space-x-3 p-3 hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'info' ? 'bg-blue-500' :
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" className="w-4 h-4 p-0">
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  {index < mockNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </ScrollArea>
        {mockNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;