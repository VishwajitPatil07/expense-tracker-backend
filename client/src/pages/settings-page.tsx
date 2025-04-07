import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preferences");
  
  // Settings state
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [autoExport, setAutoExport] = useState(false);
  
  // Save notification settings
  const saveNotificationSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  // Save appearance settings
  const saveAppearanceSettings = () => {
    toast({
      title: "Appearance updated",
      description: "Your appearance settings have been saved.",
    });
  };
  
  // Save data settings
  const saveDataSettings = () => {
    toast({
      title: "Data settings saved",
      description: "Your data export preferences have been updated.",
    });
  };
  
  // Delete account handler
  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Please check your email to confirm account deletion.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <main className="min-h-screen bg-neutral-50 pb-10 transition-all duration-300 w-full lg:ml-64">
        {/* Top Navigation */}
        <TopNav pageTitle="Settings" />
        
        {/* Settings Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you want to receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-neutral-500">Receive email alerts for important updates</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notificationsEmail}
                        onCheckedChange={setNotificationsEmail}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                        <p className="text-sm text-neutral-500">Get notified in the app about activity</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notificationsPush}
                        onCheckedChange={setNotificationsPush}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={saveNotificationSettings}>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the application looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                        <p className="text-sm text-neutral-500">Use dark theme for the application</p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="font-medium">Currency Display</Label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-md border border-neutral-300 p-2"
                      >
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                        <option value="JPY">Japanese Yen (¥)</option>
                        <option value="CAD">Canadian Dollar (C$)</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button onClick={saveAppearanceSettings}>Save Appearance</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Data Tab */}
            <TabsContent value="data">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Control your data export and backup options.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-export" className="font-medium">Automatic Export</Label>
                        <p className="text-sm text-neutral-500">Monthly CSV export of your transactions</p>
                      </div>
                      <Switch
                        id="auto-export"
                        checked={autoExport}
                        onCheckedChange={setAutoExport}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button onClick={saveDataSettings}>Save Settings</Button>
                    <Button variant="outline">Export All Data</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-danger-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-danger-200 bg-danger-50 p-4">
                    <h4 className="font-medium text-danger-800 mb-2">Delete Account</h4>
                    <p className="text-sm text-danger-700 mb-4">
                      Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                    >
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}