
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
}

const translations = {
  english: {
    'welcome': 'Welcome',
    'dashboard': 'Dashboard',
    'reportPerson': 'Report Person',
    'myReports': 'My Reports',
    'routePlanner': 'Route Planner',
    'nearbyPlaces': 'Nearby Places',
    'emergencySOS': 'Emergency SOS',
    'logout': 'Logout',
    'profile': 'Profile',
    'settings': 'Settings',
    'login': 'Login',
    'signup': 'Sign Up',
    'name': 'Name',
    'email': 'Email',
    'phone': 'Phone Number',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'signInAs': 'Sign In As',
    'signUpAs': 'Sign Up As',
    'user': 'User',
    'authority': 'Authority',
    'admin': 'Admin',
    'preferredLanguage': 'Preferred Language',
    'lostFound': 'Lost & Found Persons',
    'routesAndPlaces': 'Routes & Places',
    'assistance': 'Assistance & Emergency',
    'chatWithUs': 'Chat With Us',
    'emergency': 'Emergency',
    'accommodation': 'Accommodation',
    'food': 'Food & Restaurants',
    'templeFinder': 'Temple Finder',
    'reportLostPerson': 'Report Lost Person',
    'reportFoundPerson': 'Report Found Person',
    'updateReport': 'Update Report',
    'deleteReport': 'Delete Report',
    'viewStatus': 'View Status',
    'findNearby': 'Find Nearby',
    'voiceNavigation': 'Voice Navigation',
    'bookNow': 'Book Now',
    'callEmergency': 'Call Emergency',
    'shareLocation': 'Share Location',
    'filterResults': 'Filter Results',
    'viewMap': 'View Map',
    'getDirections': 'Get Directions',
  },
  hindi: {
    'welcome': 'स्वागत है',
    'dashboard': 'डैशबोर्ड',
    'reportPerson': 'व्यक्ति की रिपोर्ट करें',
    'myReports': 'मेरी रिपोर्ट',
    'routePlanner': 'मार्ग योजनाकार',
    'nearbyPlaces': 'आस-पास के स्थान',
    'emergencySOS': 'आपातकालीन SOS',
    'logout': 'लॉग आउट',
    'profile': 'प्रोफ़ाइल',
    'settings': 'सेटिंग्स',
    'login': 'लॉग इन',
    'signup': 'साइन अप',
    'name': 'नाम',
    'email': 'ईमेल',
    'phone': 'फोन नंबर',
    'password': 'पासवर्ड',
    'confirmPassword': 'पासवर्ड की पुष्टि करें',
    'signInAs': 'इस रूप में साइन इन करें',
    'signUpAs': 'इस रूप में साइन अप करें',
    'user': 'उपयोगकर्ता',
    'authority': 'अधिकारी',
    'admin': 'व्यवस्थापक',
    'preferredLanguage': 'पसंदीदा भाषा',
    'lostFound': 'खोए और मिले व्यक्ति',
    'routesAndPlaces': 'मार्ग और स्थान',
    'assistance': 'सहायता और आपातकाल',
    'chatWithUs': 'हमसे चैट करें',
    'emergency': 'आपातकाल',
    'accommodation': 'आवास',
    'food': 'भोजन और रेस्तरां',
    'templeFinder': 'मंदिर फाइंडर',
    'reportLostPerson': 'खोए व्यक्ति की रिपोर्ट करें',
    'reportFoundPerson': 'मिले व्यक्ति की रिपोर्ट करें',
    'updateReport': 'रिपोर्ट अपडेट करें',
    'deleteReport': 'रिपोर्ट हटाएं',
    'viewStatus': 'स्थिति देखें',
    'findNearby': 'आस-पास खोजें',
    'voiceNavigation': 'वॉयस नेविगेशन',
    'bookNow': 'अभी बुक करें',
    'callEmergency': 'आपातकाल कॉल करें',
    'shareLocation': 'लोकेशन शेयर करें',
    'filterResults': 'परिणाम फ़िल्टर करें',
    'viewMap': 'मानचित्र देखें',
    'getDirections': 'दिशा-निर्देश प्राप्त करें',
  },
  marathi: {
    'welcome': 'स्वागत आहे',
    'dashboard': 'डॅशबोर्ड',
    'reportPerson': 'व्यक्तीची तक्रार करा',
    'myReports': 'माझ्या तक्रारी',
    'routePlanner': 'मार्ग नियोजक',
    'nearbyPlaces': 'जवळपासची ठिकाणे',
    'emergencySOS': 'आपत्कालीन SOS',
    'logout': 'लॉग आउट',
    'profile': 'प्रोफाइल',
    'settings': 'सेटिंग्ज',
    'login': 'लॉगिन',
    'signup': 'साइन अप',
    'name': 'नाव',
    'email': 'ईमेल',
    'phone': 'फोन नंबर',
    'password': 'पासवर्ड',
    'confirmPassword': 'पासवर्ड पुष्टी करा',
    'signInAs': 'या स्वरूपात साइन इन करा',
    'signUpAs': 'या स्वरूपात साइन अप करा',
    'user': 'वापरकर्ता',
    'authority': 'अधिकारी',
    'admin': 'प्रशासक',
    'preferredLanguage': 'प्राधान्य भाषा',
    'lostFound': 'हरवलेले आणि सापडलेले लोक',
    'routesAndPlaces': 'मार्ग आणि ठिकाणे',
    'assistance': 'सहाय्य आणि आपत्कालीन',
    'chatWithUs': 'आमच्याशी चॅट करा',
    'emergency': 'आपत्कालीन',
    'accommodation': 'निवास',
    'food': 'अन्न आणि रेस्टॉरंट',
    'templeFinder': 'मंदिर शोधक',
    'reportLostPerson': 'हरवलेल्या व्यक्तीची तक्रार करा',
    'reportFoundPerson': 'सापडलेल्या व्यक्तीची तक्रार करा',
    'updateReport': 'अहवाल अपडेट करा',
    'deleteReport': 'अहवाल हटवा',
    'viewStatus': 'स्थिती पहा',
    'findNearby': 'जवळपास शोधा',
    'voiceNavigation': 'व्हॉइस नेव्हिगेशन',
    'bookNow': 'आता बुक करा',
    'callEmergency': 'आपत्कालीन कॉल करा',
    'shareLocation': 'लोकेशन शेअर करा',
    'filterResults': 'निकाल फिल्टर करा',
    'viewMap': 'नकाशा पहा',
    'getDirections': 'दिशा मिळवा',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  useEffect(() => {
    // Load preferred language from localStorage on initial load
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['english', 'hindi', 'marathi'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const translate = (key: string): string => {
    return translations[language][key as keyof typeof translations.english] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
