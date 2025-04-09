
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Settings, ActivityLog, ChartBar, Bell } from "lucide-react";
import UserSettingsPanel from "@/components/UserSettingsPanel";
import AuditLogPanel from "@/components/AuditLogPanel";
import PerformanceDashboard from "@/components/dashboard/PerformanceDashboard";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Customize your experience and monitor system performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
        
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">User Settings</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ActivityLog className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-6">
            <UserSettingsPanel />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsTab />
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <PerformanceDashboard />
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-6">
            <AuditLogPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;
