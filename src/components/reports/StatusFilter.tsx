
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const { language } = useLanguage();
  
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={getLocalizedText("Filter by Status", "स्थिति से फ़िल्टर करें", "स्थिती द्वारे फिल्टर करा")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{getLocalizedText("All Reports", "सभी रिपोर्ट", "सर्व अहवाल")}</SelectItem>
        <SelectItem value="pending">{getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}</SelectItem>
        <SelectItem value="under_review">{getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}</SelectItem>
        <SelectItem value="found">{getLocalizedText("Found", "मिल गया", "सापडले")}</SelectItem>
        <SelectItem value="matched">{getLocalizedText("Matched", "मिल गया", "जुळले")}</SelectItem>
        <SelectItem value="closed">{getLocalizedText("Closed", "बंद", "बंद")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
