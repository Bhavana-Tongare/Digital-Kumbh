
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Language } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  currentLanguage, 
  setLanguage 
}) => {
  const { toast } = useToast();

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    localStorage.setItem('preferred-language', language);
    
    // Show toast notification when language is changed
    toast({
      title: language === 'english' 
        ? 'Language Changed' 
        : language === 'hindi' 
          ? 'भाषा बदली गई' 
          : 'भाषा बदलली',
      description: language === 'english' 
        ? 'Your language preference has been updated to English' 
        : language === 'hindi' 
          ? 'आपकी भाषा प्राथमिकता हिंदी में अपडेट की गई है' 
          : 'तुमची भाषा प्राधान्यक्रम मराठी मध्ये अपडेट केला आहे',
      duration: 3000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('english')}
          className={currentLanguage === 'english' ? 'bg-orange-50 text-pilgrim-orange' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('hindi')}
          className={currentLanguage === 'hindi' ? 'bg-orange-50 text-pilgrim-orange' : ''}
        >
          हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('marathi')}
          className={currentLanguage === 'marathi' ? 'bg-orange-50 text-pilgrim-orange' : ''}
        >
          मराठी (Marathi)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
