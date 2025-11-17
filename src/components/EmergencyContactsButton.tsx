import React from 'react';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const EmergencyContactsButton = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleClick = () => {
    navigate('/emergency-contacts');
  };

  return (
    <button 
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-[#FF8C42] hover:bg-[#FF7629] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all transform hover:scale-110 z-50"
      aria-label={getLocalizedText(
        "Emergency Contacts",
        "आपातकालीन संपर्क",
        "आपत्कालीन संपर्क"
      )}
    >
      <span className="sr-only">
        {getLocalizedText(
          "Emergency Contacts",
          "आपातकालीन संपर्क",
          "आपत्कालीन संपर्क"
        )}
      </span>
      <Phone className="w-7 h-7" strokeWidth={2.5} />
    </button>
  );
};

export default EmergencyContactsButton;
