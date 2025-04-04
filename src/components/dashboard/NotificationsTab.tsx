
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  Check,
  TrendingUp,
} from "lucide-react";
import { markNotificationRead, dismissAllNotifications } from "@/utils/exportUtils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Notification = {
  id: number;
  type: "alert" | "reminder" | "update";
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
};

const NotificationsTab = () => {
  // Initial notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "alert",
      title: "High Risk Alert",
      description: "David Kim's retention score has dropped below 40%. Consider immediate action.",
      time: "2 hours ago",
      read: false,
      icon: <AlertCircle className="h-5 w-5 text-risk-high" />
    },
    {
      id: 2,
      type: "reminder",
      title: "Scheduled Review",
      description: "Performance review for Maria Garcia is due next week.",
      time: "Yesterday",
      read: false,
      icon: <Calendar className="h-5 w-5 text-blue-500" />
    },
    {
      id: 3,
      type: "update",
      title: "Improved Score",
      description: "James Taylor's retention score has improved by 15% this month.",
      time: "3 days ago",
      read: true,
      icon: <TrendingUp className="h-5 w-5 text-risk-low" />
    },
    {
      id: 4,
      type: "alert",
      title: "Department Risk Alert",
      description: "Design department showing highest turnover risk this quarter.",
      time: "1 week ago",
      read: true,
      icon: <AlertCircle className="h-5 w-5 text-risk-medium" />
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    app: true,
    highRiskAlerts: true,
    weeklyDigest: true,
    newEmployees: false
  });

  const handleMarkAsRead = (notificationId: number) => {
    markNotificationRead(notificationId);
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
  };

  const handleDismissAll = () => {
    if (dismissAllNotifications()) {
      setNotifications([]);
    }
  };

  const handleSettingChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
    toast.success(`${setting} notifications ${!notificationSettings[setting] ? 'enabled' : 'disabled'}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary w-6 h-6 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleDismissAll}>
            <BellOff className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Stay updated on important retention events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-4 p-4 border rounded-lg ${
                      notification.read ? '' : 'bg-muted/30'
                    }`}
                  >
                    <div className="mt-0.5">{notification.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No notifications to display</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch 
                  checked={notificationSettings.email} 
                  onCheckedChange={() => handleSettingChange('email')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-muted-foreground">Show alerts in dashboard</p>
                </div>
                <Switch 
                  checked={notificationSettings.app} 
                  onCheckedChange={() => handleSettingChange('app')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">Immediate alerts for high risk employees</p>
                </div>
                <Switch 
                  checked={notificationSettings.highRiskAlerts} 
                  onCheckedChange={() => handleSettingChange('highRiskAlerts')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">Summary of retention metrics</p>
                </div>
                <Switch 
                  checked={notificationSettings.weeklyDigest} 
                  onCheckedChange={() => handleSettingChange('weeklyDigest')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Employee Alerts</p>
                  <p className="text-sm text-muted-foreground">Notifications about new hires</p>
                </div>
                <Switch 
                  checked={notificationSettings.newEmployees} 
                  onCheckedChange={() => handleSettingChange('newEmployees')} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsTab;
