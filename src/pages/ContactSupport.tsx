import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';

const ContactSupport: React.FC = () => {
  const { language } = useLanguage();

  const t = (eng: string, hi: string, mr: string) => {
    if (language === 'hindi') return hi;
    if (language === 'marathi') return mr;
    return eng;
  };

  return (
    <DashboardLayout title={t('Contact Support', 'सहायता से संपर्क करें', 'सहाय्याशी संपर्क करा')}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Emergency Contacts', 'आपातकालीन संपर्क', 'आपत्कालीन संपर्क')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" /> {t('General Helpline', 'सामान्य हेल्पलाइन', 'सामान्य हेल्पलाइन')}</div>
              <div className="text-gray-700 mt-1">112</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" /> {t('Medical/First Aid', 'मेडिकल/प्राथमिक उपचार', 'वैद्यकीय/पहिली मदत')}</div>
              <div className="text-gray-700 mt-1">108</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4" /> {t('Police/Authority', 'पुलिस/प्राधिकरण', 'पोलीस/प्राधिकरण')}</div>
              <div className="text-gray-700 mt-1">100</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Support Desk', 'सपोर्ट डेस्क', 'समर्थन डेस्क')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700"><Mail className="h-4 w-4" />kumbhmela001@gmail.com </div>
              <div className="flex items-center gap-2 text-gray-700"><Phone className="h-4 w-4" /> +91-99999-00000</div>
              <div className="flex items-center gap-2 text-gray-700"><MessageCircle className="h-4 w-4" /> {t('In-app chat available 9 AM – 9 PM', 'इन-ऐप चैट 9 AM – 9 PM उपलब्ध', 'इन-अॅप चॅट 9 AM – 9 PM उपलब्ध')}</div>
              <div className="flex items-center gap-2 text-gray-700"><Clock className="h-4 w-4" /> {t('Working Hours: 7 AM – 10 PM (IST)', 'कार्य समय: 7 AM – 10 PM (IST)', 'कार्य वेळ: 7 AM – 10 PM (IST)')}</div>
              <div className="flex items-center gap-2 text-gray-700"><MapPin className="h-4 w-4" /> {t('Help Center Tent near Main Gate', 'मुख्य द्वार के पास हेल्प सेंटर टेंट', 'मुख्य प्रवेशद्वाराशेजारी हेल्प सेंटर तंबू')}</div>
            </div>
            {/* Contact form removed as requested; direct contact details remain */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContactSupport;


