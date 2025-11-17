
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import FloatingToggle from '@/components/FloatingToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserCircle2, 
  Menu, 
  X, 
  Home, 
  Map, 
  FileSearch, 
  AlertCircle, 
  LogOut,
  Landmark,
  PenSquare,
  Users,
  BarChart3
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  title = 'Dashboard'
}) => {
  const { user, logoutUser, updateLanguagePreference } = useAuth();
  const { language, setLanguage, translate } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update user's language preference when language changes
  useEffect(() => {
    if (user && language !== user.preferredLanguage) {
      updateLanguagePreference(language);
    }
  }, [language, user]);

  // Set initial language based on user preference
  useEffect(() => {
    if (user && user.preferredLanguage) {
      setLanguage(user.preferredLanguage);
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const userNavigation = [
    { name: translate('dashboard'), icon: <Home className="w-5 h-5" />, href: '/dashboard' },
    { name: translate('reportPerson'), icon: <PenSquare className="w-5 h-5" />, href: '/report-missing' },
    { name: translate('myReports'), icon: <FileSearch className="w-5 h-5" />, href: '/my-reports' },
    { name: translate('routePlanner'), icon: <Map className="w-5 h-5" />, href: '/routes' },
    // Nearby Places removed from user dashboard navigation
  ];

  const authorityNavigation = [
    { name: translate('dashboard'), icon: <Home className="w-5 h-5" />, href: '/dashboard' },
    { name: language === 'english' ? 'Lost and Found Reports' : language === 'hindi' ? 'सभी लापता और मिले हुए रिपोर्ट' : 'सर्व हरवलेले आणि सापडलेले अहवाल', icon: <FileSearch className="w-5 h-5" />, href: '/all-reports' },
    { name: translate('reportPerson'), icon: <PenSquare className="w-5 h-5" />, href: '/report-missing' },
    { name: language === 'english' ? 'Analytics' : language === 'hindi' ? 'विश्लेषण' : 'विश्लेषण', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
  ];

  const adminNavigation = [
    { name: translate('dashboard'), icon: <Home className="w-5 h-5" />, href: '/dashboard' },
    { name: language === 'english' ? 'User Management' : language === 'hindi' ? 'उपयोगकर्ता प्रबंधन' : 'वापरकर्ता व्यवस्थापन', icon: <Users className="w-5 h-5" />, href: '/users' },
    { name: language === 'english' ? 'Lost and Found Reports' : language === 'hindi' ? 'सभी लापता और मिले हुए रिपोर्ट' : 'सर्व हरवलेले आणि सापडलेले अहवाल', icon: <FileSearch className="w-5 h-5" />, href: '/all-reports' },
    { name: language === 'english' ? 'Analytics' : language === 'hindi' ? 'विश्लेषण' : 'विश्लेषण', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
  ];

  let navigation = userNavigation;
  if (user.role === 'authority') {
    navigation = authorityNavigation;
  } else if (user.role === 'admin') {
    navigation = adminNavigation;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                className="md:hidden -ml-2 mr-2 p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6 text-pilgrim-brown" />
                ) : (
                  <Menu className="h-6 w-6 text-pilgrim-brown" />
                )}
              </button>
              <Logo size="small" />
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher currentLanguage={language} setLanguage={setLanguage} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <UserCircle2 className="h-6 w-6 text-pilgrim-brown" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="font-normal text-sm">
                      {language === 'english' ? 'Signed in as' : language === 'hindi' ? 'इस रूप में साइन इन' : 'म्हणून साइन इन'}
                    </div>
                    <div className="font-semibold">{user.name}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full mr-2 font-medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    {language === 'english' ? 'Profile Settings' : language === 'hindi' ? 'प्रोफ़ाइल सेटिंग्स' : 'प्रोफाइल सेटिंग्ज'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> {translate('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white shadow-xl">
            <div className="w-full flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4">
                <Logo size="small" />
                <button
                  className="p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-pilgrim-brown" />
                </button>
              </div>
              <div className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`w-full justify-start text-left pl-4 rounded-lg ${
                      window.location.pathname === item.href 
                        ? 'bg-pilgrim-peach text-pilgrim-orange'
                        : 'text-gray-700 hover:bg-pilgrim-peach/10'
                    }`}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </div>
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left pl-4 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5" />
                    <span className="ml-3">{translate('logout')}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-56">
            <div className="flex flex-col h-0 flex-1 shadow-inner bg-white border-r">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="mt-8 flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start text-left pl-4 rounded-lg ${
                        window.location.pathname === item.href 
                          ? 'bg-pilgrim-peach text-pilgrim-orange'
                          : 'text-gray-700 hover:bg-pilgrim-peach/10'
                      }`}
                      onClick={() => navigate(item.href)}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 flex border-t p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5" />
                    <span className="ml-3">{translate('logout')}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-auto bg-gray-50">
          <main className="flex-1 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {user.role !== 'authority' && <FloatingToggle />}
    </div>
  );
};

export default DashboardLayout;
