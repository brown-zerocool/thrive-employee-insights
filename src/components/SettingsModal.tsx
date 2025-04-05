
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    theme: "light",
    language: "english",
    dataPrivacy: true,
  });

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, you would save the settings to the server here
    toast.success("Settings saved successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => handleSelectChange('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => handleSelectChange('language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 pt-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">Receive email notifications for important updates</span>
              </Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="desktopNotifications" className="flex flex-col space-y-1">
                <span>Desktop Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">Show desktop notifications when application is open</span>
              </Label>
              <Switch
                id="desktopNotifications"
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => handleSwitchChange('desktopNotifications', checked)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4 pt-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dataPrivacy" className="flex flex-col space-y-1">
                <span>Data Privacy</span>
                <span className="font-normal text-sm text-muted-foreground">Allow data collection for improving the service</span>
              </Label>
              <Switch
                id="dataPrivacy"
                checked={settings.dataPrivacy}
                onCheckedChange={(checked) => handleSwitchChange('dataPrivacy', checked)}
              />
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                Export My Data
              </Button>
            </div>
            
            <div className="pt-2">
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
