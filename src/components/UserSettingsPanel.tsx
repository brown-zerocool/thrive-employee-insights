import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { fromUserPreferences, fromEmployees } from "@/integrations/supabase/customClient";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Bell, Shield, Workflow, Layout } from "lucide-react";

interface UserPreferences {
  id?: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  language: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    high_risk_alerts: boolean;
    weekly_digest: boolean;
    model_training_complete: boolean;
  };
  risk_threshold: number;
  default_departments: string[];
  created_at?: string;
  updated_at?: string;
}

const defaultPreferences: UserPreferences = {
  user_id: "",
  theme: "system",
  language: "en",
  notification_settings: {
    email: true,
    push: true,
    high_risk_alerts: true,
    weekly_digest: true,
    model_training_complete: true,
  },
  risk_threshold: 70,
  default_departments: [],
};

const UserSettingsPanel: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const { session } = useAuth();
  const userId = session?.user?.id || "";

  useEffect(() => {
    if (userId) {
      loadUserPreferences();
      loadAvailableDepartments();
    }
  }, [userId]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await fromUserPreferences()
        .select('*')
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows found"
        throw error;
      }

      if (data) {
        setPreferences(data as UserPreferences);
        setSelectedDepartments(data.default_departments || []);
      } else {
        // Create default preferences
        setPreferences({
          ...defaultPreferences,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      toast.error("Failed to load user preferences");
    }
  };

  const loadAvailableDepartments = async () => {
    try {
      const { data, error } = await fromEmployees()
        .select('department')
        .not("department", "is", null);

      if (error) throw error;

      // Extract unique departments
      const uniqueDepartments = Array.from(
        new Set(data?.map((item) => item.department).filter(Boolean))
      );
      
      setAvailableDepartments(uniqueDepartments as string[]);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const savePreferences = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const prefsToSave = {
        ...preferences,
        default_departments: selectedDepartments,
        updated_at: new Date().toISOString(),
      };

      const { error } = await fromUserPreferences()
        .upsert(prefsToSave as any, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof UserPreferences["notification_settings"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value,
      },
    }));
  };

  const toggleDepartment = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </div>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">
              <Layout className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Workflow className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Departments</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Risk Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      theme: value as "light" | "dark" | "system",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      language: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notification_settings.email}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting("email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in the app
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notification_settings.push}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting("push", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="risk-alerts">High Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts for high risk employees
                  </p>
                </div>
                <Switch
                  id="risk-alerts"
                  checked={preferences.notification_settings.high_risk_alerts}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting("high_risk_alerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary report
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={preferences.notification_settings.weekly_digest}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting("weekly_digest", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="model-training">Model Training Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when models complete training
                  </p>
                </div>
                <Switch
                  id="model-training"
                  checked={preferences.notification_settings.model_training_complete}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting("model_training_complete", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4 pt-4">
            <div>
              <Label>Default Departments</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select departments to view by default in reports and dashboards
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableDepartments.map((department) => (
                  <div key={department} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dept-${department}`}
                      className="rounded text-primary focus:ring-primary"
                      checked={selectedDepartments.includes(department)}
                      onChange={() => toggleDepartment(department)}
                    />
                    <Label htmlFor={`dept-${department}`}>{department}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="risk-threshold">
                  Risk Threshold: {preferences.risk_threshold}%
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Set the threshold for high risk employees
                </p>
                <Slider
                  id="risk-threshold"
                  min={50}
                  max={90}
                  step={1}
                  value={[preferences.risk_threshold]}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      risk_threshold: value[0],
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserSettingsPanel;
