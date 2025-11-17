import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  if (!user) return null;

  const applyTheme = (enabled: boolean) => {
    setDarkMode(enabled);
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSaveProfile = () => {
    // Persist to localStorage for now; integrate with backend later
    const stored = localStorage.getItem('pilgrim-user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, name, email, phoneNumber: phone };
        localStorage.setItem('pilgrim-user', JSON.stringify(updated));
        window.location.reload();
      } catch {}
    }
  };

  return (
    <DashboardLayout title="Profile Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="pt-2">
              <Button onClick={handleSaveProfile} className="bg-pilgrim-orange hover:bg-orange-600 text-white">Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-gray-500">Toggle dark theme for the app</div>
              </div>
              <Switch checked={darkMode} onCheckedChange={applyTheme} />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Language</CardTitle>
            </CardHeader>
            <CardContent className="space-x-2">
              <Button variant={language === 'english' ? 'default' : 'outline'} onClick={() => setLanguage('english')}>English</Button>
              <Button variant={language === 'hindi' ? 'default' : 'outline'} onClick={() => setLanguage('hindi')}>हिंदी</Button>
              <Button variant={language === 'marathi' ? 'default' : 'outline'} onClick={() => setLanguage('marathi')}>मराठी</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;


