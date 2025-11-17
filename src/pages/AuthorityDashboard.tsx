import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileSearch, AlertCircle, Users, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthorityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const navigate = useNavigate();




  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };


  const quickActions = [
    {
      title: language === 'english' ? 'Lost & Found Reports' : language === 'hindi' ? 'खोया पाया रिपोर्ट' : 'हरवलेले आणि सापडलेले अहवाल',
      icon: <FileSearch className="h-6 w-6 text-pilgrim-brown" />,
      description: language === 'english' ? 'Manage missing person reports' : language === 'hindi' ? 'लापता व्यक्ति रिपोर्ट प्रबंधित करें' : 'हरवलेल्या व्यक्तींचे अहवाल व्यवस्थापित करा',
      path: '/manage-reports'
    },
    {
      title: language === 'english' ? 'Crowd Monitoring' : language === 'hindi' ? 'भीड़ निगरानी' : 'गर्दी निरीक्षण',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      description: language === 'english' ? 'Monitor crowd levels' : language === 'hindi' ? 'भीड़ स्तर की निगरानी करें' : 'गर्दीचे स्तर निरीक्षण करा',
      status: 'Green',
      path: '/crowd-monitoring'
    },
    {
      title: language === 'english' ? 'Digital Screens' : language === 'hindi' ? 'डिजिटल स्क्रीन' : 'डिजिटल स्क्रीन',
      icon: <Monitor className="h-6 w-6 text-green-500" />,
      description: language === 'english' ? 'Manage digital screens' : language === 'hindi' ? 'डिजिटल स्क्रीन प्रबंधित करें' : 'डिजिटल स्क्रीन व्यवस्थापित करा',
      path: '/screen-manager'
    },
    {
      title: language === 'english' ? 'Emergency Alerts' : language === 'hindi' ? 'आपातकालीन अलर्ट' : 'आपत्कालीन सूचना',
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      description: language === 'english' ? 'View and respond to SOS alerts' : language === 'hindi' ? 'SOS अलर्ट देखें और प्रतिक्रिया दें' : 'SOS सूचना पहा आणि प्रतिसाद द्या',
      path: '/emergency-alerts'
    },
  ];

  // Add a null check for user before accessing user.name
  const welcomeMessage = user ? (
    language === 'english'
      ? `Welcome, ${user.name}!`
      : language === 'hindi'
        ? `स्वागत है, ${user.name}!`
        : `स्वागत आहे, ${user.name}!`
  ) : (
    language === 'english'
      ? 'Welcome!'
      : language === 'hindi'
        ? 'स्वागत है!'
        : 'स्वागत आहे!'
  );

  const subtitleMessage = language === 'english'
    ? 'Authority Dashboard'
    : language === 'hindi'
      ? 'अधिकारी डैशबोर्ड'
      : 'अधिकारी डॅशबोर्ड';



  return (
    <DashboardLayout title={translate('dashboard')}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-pilgrim-brown">{welcomeMessage}</h1>
          <p className="text-gray-600 mt-2">{subtitleMessage}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {action.icon}
                  {action.count && (
                    <span className="bg-pilgrim-orange text-white px-2 py-1 rounded-full text-xs">
                      {action.count}
                    </span>
                  )}
                  {action.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      action.status === 'Green' ? 'bg-green-100 text-green-700' : 
                      action.status === 'Yellow' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {action.status}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold mt-2">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[40px]">{action.description}</CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-pilgrim-brown text-pilgrim-brown hover:bg-gray-50"
                  onClick={() => navigate(action.path)}
                >
                  {language === 'english' ? 'Manage' : language === 'hindi' ? 'प्रबंधन करें' : 'व्यवस्थापित करा'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AuthorityDashboard;
