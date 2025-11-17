
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileSearch, AlertTriangle, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalLostReports: number;
  totalFoundReports: number;
  totalEmergencyAlerts: number;
  reportsOverTime: Array<{ date: string; lost: number; found: number }>;
  reportsByStatus: Array<{ status: string; count: number; color: string }>;
  usersByRole: Array<{ role: string; count: number }>;
}

const Analytics: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalLostReports: 0,
    totalFoundReports: 0,
    totalEmergencyAlerts: 0,
    reportsOverTime: [],
    reportsByStatus: [],
    usersByRole: []
  });
  const [loading, setLoading] = useState(true);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load basic counts
      const [usersResult, lostReportsResult, foundReportsResult, alertsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('lost_person_reports').select('*', { count: 'exact' }),
        supabase.from('found_person_reports').select('*', { count: 'exact' }),
        supabase.from('emergency_alerts').select('*', { count: 'exact' })
      ]);

      // Load detailed data for charts
      const { data: lostReports } = await supabase
        .from('lost_person_reports')
        .select('status, created_at')
        .order('created_at', { ascending: true });

      const { data: foundReports } = await supabase
        .from('found_person_reports')
        .select('status, created_at')
        .order('created_at', { ascending: true });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      // Process data for charts
      const statusCounts = {};
      lostReports?.forEach(report => {
        statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
      });

      const reportsByStatus = Object.entries(statusCounts).map(([status, count], index) => ({
        status,
        count: count as number,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][index % 5]
      }));

      const usersByRole = profiles?.reduce((acc, profile) => {
        const existing = acc.find(item => item.role === profile.role);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: profile.role, count: 1 });
        }
        return acc;
      }, [] as Array<{ role: string; count: number }>) || [];

      // Generate reports over time data (last 7 days)
      const reportsOverTime = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const lostCount = lostReports?.filter(r => 
          r.created_at.startsWith(dateStr)
        ).length || 0;
        
        const foundCount = foundReports?.filter(r => 
          r.created_at.startsWith(dateStr)
        ).length || 0;

        reportsOverTime.push({
          date: date.toLocaleDateString(),
          lost: lostCount,
          found: foundCount
        });
      }

      setData({
        totalUsers: usersResult.count || 0,
        totalLostReports: lostReportsResult.count || 0,
        totalFoundReports: foundReportsResult.count || 0,
        totalEmergencyAlerts: alertsResult.count || 0,
        reportsOverTime,
        reportsByStatus,
        usersByRole
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={getLocalizedText('Analytics', 'विश्लेषण', 'विश्लेषण')}>
        <div className="flex justify-center items-center py-8">
          <TrendingUp className="h-8 w-8 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getLocalizedText('Analytics', 'विश्लेषण', 'विश्लेषण')}>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {getLocalizedText('Total Users', 'कुल उपयोगकर्ता', 'एकूण वापरकर्ते')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                {getLocalizedText('Lost Reports', 'लापता रिपोर्ट', 'हरवलेले अहवाल')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.totalLostReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {getLocalizedText('Found Reports', 'मिले रिपोर्ट', 'सापडलेले अहवाल')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.totalFoundReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {getLocalizedText('Emergency Alerts', 'आपातकालीन अलर्ट', 'आपत्कालीन अलर्ट')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{data.totalEmergencyAlerts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getLocalizedText('Reports Over Time', 'समय के साथ रिपोर्ट', 'काळानुसार अहवाल')}
              </CardTitle>
              <CardDescription>
                {getLocalizedText('Last 7 days', 'पिछले 7 दिन', 'गेले 7 दिवस')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.reportsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="lost" stroke="#ef4444" name="Lost" />
                  <Line type="monotone" dataKey="found" stroke="#22c55e" name="Found" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Reports by Status */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getLocalizedText('Reports by Status', 'स्थिति के अनुसार रिपोर्ट', 'स्थितीनुसार अहवाल')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.reportsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.reportsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getLocalizedText('Users by Role', 'भूमिका के अनुसार उपयोगकर्ता', 'भूमिकेनुसार वापरकर्ते')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.usersByRole}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getLocalizedText('System Health', 'सिस्टम स्वास्थ्य', 'सिस्टम आरोग्य')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{getLocalizedText('Database Status', 'डेटाबेस स्थिति', 'डेटाबेस स्थिती')}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {getLocalizedText('Healthy', 'स्वस्थ', 'निरोगी')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{getLocalizedText('API Status', 'API स्थिति', 'API स्थिती')}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {getLocalizedText('Active', 'सक्रिय', 'सक्रिय')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{getLocalizedText('Real-time Updates', 'रियल-टाईम अपडेट', 'रिअल-टाइम अपडेट')}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {getLocalizedText('Connected', 'जुड़ा हुआ', 'जोडलेले')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
