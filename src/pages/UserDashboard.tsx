import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import HeroSlider from '@/components/HeroSlider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Map, MapPin, Phone, MessageSquare, Hotel, Route, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { translate, language } = useLanguage();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Main dashboard cards - 4 primary actions
  const mainCards = [
    {
      title: getLocalizedText(
        'Report Missing Person',
        'लापता व्यक्ति की रिपोर्ट करें',
        'हरवलेल्या व्यक्तीची तक्रार करा'
      ),
      icon: <FileText className="h-8 w-8 text-pilgrim-orange" />,
      description: getLocalizedText(
        'Report a missing person with details and photos',
        'विवरण और फोटो के साथ लापता व्यक्ति की रिपोर्ट करें',
        'तपशील आणि फोटोसह हरवलेल्या व्यक्तीची तक्रार करा'
      ),
      path: '/report-missing',
      color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
      iconBg: 'bg-red-100'
    },
    {
      title: getLocalizedText(
        'My Reports',
        'मेरी रिपोर्ट',
        'माझ्या तक्रारी'
      ),
      icon: <Bell className="h-8 w-8 text-pilgrim-orange" />,
      description: getLocalizedText(
        'View and manage all your submitted reports',
        'अपनी सभी जमा रिपोर्ट देखें और प्रबंधित करें',
        'तुमच्या सर्व सबमिट केलेल्या तक्रारी पहा आणि व्यवस्थापित करा'
      ),
      path: '/my-reports',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      iconBg: 'bg-blue-100'
    },
    {
      title: getLocalizedText(
        'Route Planner',
        'मार्ग योजनाकार',
        'मार्ग नियोजक'
      ),
      icon: <Route className="h-8 w-8 text-pilgrim-orange" />,
      description: getLocalizedText(
        'Find the safest and most efficient routes',
        'सबसे सुरक्षित और कुशल मार्ग खोजें',
        'सर्वात सुरक्षित आणि कार्यक्षम मार्ग शोधा'
      ),
      path: '/routes',
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      iconBg: 'bg-green-100'
    },
    {
      title: getLocalizedText(
        'Temple Guide',
        'मंदिर मार्गदर्शिका',
        'मंदिर मार्गदर्शक'
      ),
      icon: <Map className="h-8 w-8 text-pilgrim-orange" />,
      description: getLocalizedText(
        'Discover temples and sacred places nearby',
        'पास के मंदिरों और पवित्र स्थानों की खोज करें',
        'जवळची मंदिरे आणि पवित्र स्थळे शोधा'
      ),
      path: '/temples',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      iconBg: 'bg-purple-100'
    }
  ];

  const welcomeMessage = getLocalizedText(
    `Welcome, ${user.name}!`,
    `स्वागत है, ${user.name}!`,
    `स्वागत आहे, ${user.name}!`
  );

  const subtitleMessage = getLocalizedText(
    "Here's what you can do today",
    'आज आप यह कर सकते हैं',
    'आज तुम्ही हे करू शकता'
  );

  return (
    <DashboardLayout title={translate('dashboard')}>
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{welcomeMessage}</h1>
              <p className="text-lg text-gray-600">{subtitleMessage}</p>
            </div>
          </div>
        </div>

        {/* Hero Slider */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HeroSlider />
          </div>
        </div>

        {/* Main Cards Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getLocalizedText('Quick Actions', 'त्वरित कार्य', 'त्वरित क्रिया')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getLocalizedText(
                'Choose from the options below to get started',
                'शुरू करने के लिए नीचे दिए गए विकल्पों में से चुनें',
                'सुरु करण्यासाठी खालील पर्यायांमधून निवडा'
              )}
            </p>
          </div>

          {/* 4 Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {mainCards.map((card, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${card.color} border-2 hover:border-pilgrim-orange/50`}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 text-center leading-tight">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed min-h-[60px] flex items-center justify-center">
                    {card.description}
                  </CardDescription>
                  <Button 
                    variant="default" 
                    className="w-full bg-pilgrim-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate(card.path)}
                  >
                    {getLocalizedText('Get Started', 'शुरू करें', 'सुरु करा')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {getLocalizedText('Need Help?', 'मदद चाहिए?', 'मदत हवी?')}
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {getLocalizedText(
                  'If you need assistance or have any questions, our support team is here to help you.',
                  'यदि आपको सहायता की आवश्यकता है या कोई प्रश्न है, तो हमारी सहायता टीम आपकी मदद के लिए यहाँ है।',
                  'जर तुम्हाला मदतीची गरज आहे किंवा काही प्रश्न आहेत, तर आमची सहायता टीम तुमच्या मदतीसाठी येथे आहे।'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="border-pilgrim-orange text-pilgrim-orange hover:bg-pilgrim-orange hover:text-white"
                  onClick={() => navigate('/contact')}
                >
                  {getLocalizedText('Contact Support', 'सहायता से संपर्क करें', 'सहाय्याशी संपर्क करा')}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => navigate('/help')}
                >
                  {getLocalizedText('View Help Center', 'सहायता केंद्र देखें', 'मदत केंद्र पहा')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
