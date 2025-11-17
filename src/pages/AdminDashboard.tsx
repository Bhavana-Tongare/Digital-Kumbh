
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Users, FileSearch, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: language === 'english' ? 'User Management' : language === 'hindi' ? 'उपयोगकर्ता प्रबंधन' : 'वापरकर्ता व्यवस्थापन',
      icon: <Users className="h-8 w-8" />,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      description: language === 'english' ? 'Manage users and authorities' : language === 'hindi' ? 'उपयोगकर्ताओं और अधिकारियों का प्रबंधन करें' : 'वापरकर्ते आणि अधिकारी व्यवस्थापित करा',
      path: '/users'
    },
    {
      title: language === 'english' ? 'Lost and Found Reports' : language === 'hindi' ? 'सभी लापता और मिले हुए रिपोर्ट' : 'सर्व हरवलेले आणि सापडलेले अहवाल',
      icon: <FileSearch className="h-8 w-8" />,
      iconColor: 'text-pilgrim-brown',
      iconBg: 'bg-pilgrim-peach',
      description: language === 'english' ? 'View and manage all lost and found reports' : language === 'hindi' ? 'सभी लापता और मिले हुए रिपोर्ट देखें और प्रबंधित करें' : 'सर्व हरवलेले आणि सापडलेले अहवाल पहा आणि व्यवस्थापित करा',
      path: '/all-reports'
    },
    {
      title: language === 'english' ? 'Analytics' : language === 'hindi' ? 'विश्लेषण' : 'विश्लेषण',
      icon: <BarChart3 className="h-8 w-8" />,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
      description: language === 'english' ? 'System-wide statistics' : language === 'hindi' ? 'सिस्टम-व्यापी आंकड़े' : 'सिस्टम-व्यापी आकडेवारी',
      path: '/analytics'
    }
  ];

  const welcomeMessage = language === 'english'
    ? `Welcome, ${user.name}!`
    : language === 'hindi'
      ? `स्वागत है, ${user.name}!`
      : `स्वागत आहे, ${user.name}!`;

  const subtitleMessage = language === 'english'
    ? 'Admin Dashboard'
    : language === 'hindi'
      ? 'व्यवस्थापक डैशबोर्ड'
      : 'व्यवस्थापक डॅशबोर्ड';

  return (
    <DashboardLayout title={translate('dashboard')}>
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{welcomeMessage}</h1>
              <p className="text-lg text-gray-600">{subtitleMessage}</p>
            </div>
          </div>
        </div>

        {/* Main Cards Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Heading removed as requested */}

          {/* Main Cards Grid - Centered Content with Equal Heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center h-full justify-between"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full ${action.iconBg} flex items-center justify-center mb-4`}>
                    <div className={action.iconColor}>
                      {action.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed min-h-[60px] flex items-center justify-center mb-6">
                    {action.description}
                  </p>
                </div>

                {/* Manage Button - Rounded Full - Always at Bottom */}
                <Button
                  onClick={() => navigate(action.path)}
                  className="w-full bg-pilgrim-orange hover:bg-pilgrim-orangeDark text-white font-bold py-3 rounded-full transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg mt-auto"
                >
                  {language === 'english' ? 'Manage' : language === 'hindi' ? 'प्रबंधित करें' : 'व्यवस्थापित करा'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
