
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    authorities: 0,
    regularUsers: 0
  });

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(profiles || []);
      
      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const admins = profiles?.filter(user => user.role === 'admin').length || 0;
      const authorities = profiles?.filter(user => user.role === 'authority').length || 0;
      const regularUsers = profiles?.filter(user => user.role === 'user').length || 0;

      setStats({ totalUsers, admins, authorities, regularUsers });
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: getLocalizedText('Error', 'त्रुटि', 'त्रुटी'),
        description: getLocalizedText('Failed to load users', 'उपयोगकर्ता लोड करने में विफल', 'वापरकर्ते लोड करण्यात अयशस्वी'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: getLocalizedText('Success', 'सफलता', 'यश'),
        description: getLocalizedText('User role updated successfully', 'उपयोगकर्ता भूमिका सफलतापूर्वक अपडेट की गई', 'वापरकर्ता भूमिका यशस्वीरित्या अपडेट केली')
      });

      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: getLocalizedText('Error', 'त्रुटि', 'त्रुटी'),
        description: getLocalizedText('Failed to update user role', 'उपयोगकर्ता भूमिका अपडेट करने में विफल', 'वापरकर्ता भूमिका अपडेट करण्यात अयशस्वी'),
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'authority': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={getLocalizedText('User Management', 'उपयोगकर्ता प्रबंधन', 'वापरकर्ता व्यवस्थापन')}>
        <div className="flex justify-center items-center py-8">
          <Users className="h-8 w-8 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getLocalizedText('User Management', 'उपयोगकर्ता प्रबंधन', 'वापरकर्ता व्यवस्थापन')}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {getLocalizedText('Total Users', 'कुल उपयोगकर्ता', 'एकूण वापरकर्ते')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {getLocalizedText('Admins', 'व्यवस्थापक', 'प्रशासक')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {getLocalizedText('Authorities', 'अधिकारी', 'अधिकारी')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.authorities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {getLocalizedText('Regular Users', 'नियमित उपयोगकर्ता', 'नियमित वापरकर्ते')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.regularUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {getLocalizedText('All Users', 'सभी उपयोगकर्ता', 'सर्व वापरकर्ते')}
            </CardTitle>
            <CardDescription>
              {getLocalizedText('Manage user roles and permissions', 'उपयोगकर्ता भूमिकाएं और अनुमतियां प्रबंधित करें', 'वापरकर्ता भूमिका आणि परवानग्या व्यवस्थापित करा')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{getLocalizedText('Name', 'नाम', 'नाव')}</TableHead>
                  <TableHead>{getLocalizedText('Phone', 'फोन', 'फोन')}</TableHead>
                  <TableHead>{getLocalizedText('Role', 'भूमिका', 'भूमिका')}</TableHead>
                  <TableHead>{getLocalizedText('Language', 'भाषा', 'भाषा')}</TableHead>
                  <TableHead>{getLocalizedText('Joined', 'शामिल हुआ', 'सामील झाला')}</TableHead>
                  <TableHead>{getLocalizedText('Actions', 'कार्य', 'क्रिया')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.preferred_language}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.id, 'admin')}
                          >
                            {getLocalizedText('Make Admin', 'व्यवस्थापक बनाएं', 'प्रशासक बनवा')}
                          </Button>
                        )}
                        {user.role !== 'authority' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.id, 'authority')}
                          >
                            {getLocalizedText('Make Authority', 'अधिकारी बनाएं', 'अधिकारी बनवा')}
                          </Button>
                        )}
                        {user.role !== 'user' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserRole(user.id, 'user')}
                          >
                            {getLocalizedText('Make User', 'उपयोगकर्ता बनाएं', 'वापरकर्ता बनवा')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
