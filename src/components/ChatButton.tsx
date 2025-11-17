import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const ChatButton = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <button 
      onClick={handleClick}
      className="fixed bottom-28 right-6 bg-[#FF8C42] hover:bg-[#FF7629] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all transform hover:scale-110 z-50"
      aria-label={getLocalizedText(
        "Chat with Volunteer",
        "स्वयंसेवक से चैट करें",
        "स्वयंसेवकाशी चॅट करा"
      )}
    >
      <span className="sr-only">
        {getLocalizedText(
          "Chat with Volunteer",
          "स्वयंसेवक से चैट करें",
          "स्वयंसेवकाशी चॅट करा"
        )}
      </span>
      <MessageSquare className="w-7 h-7" strokeWidth={2.5} />
    </button>
  );
};

export default ChatButton;
