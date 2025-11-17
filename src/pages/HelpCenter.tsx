import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter: React.FC = () => {
  const { language } = useLanguage();
  const t = (eng: string, hi: string, mr: string) => {
    if (language === 'hindi') return hi;
    if (language === 'marathi') return mr;
    return eng;
  };

  return (
    <DashboardLayout title={t('Help Center', 'सहायता केंद्र', 'मदत केंद्र')}>
      <div className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle>{t('Getting Started', 'शुरू करना', 'सुरु कसे करावे')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>{t('Report a missing person from the dashboard “Report Missing Person”.', 'डैशबोर्ड से “लापता व्यक्ति की रिपोर्ट करें”।', 'डॅशबोर्डवरील “हरवलेल्या व्यक्तीची तक्रार करा”.')}</li>
            <li>{t('Use Chat to ask for aarti timings, routes and support.', 'आरती समय, मार्ग और सहायता पूछने के लिए चैट का उपयोग करें।', 'आरती वेळा, मार्ग आणि सहाय्यासाठी चॅट वापरा.')}</li>
            <li>{t('Save emergency contacts in your phone for quick access.', 'त्वरित उपयोग के लिए अपने फोन में आपातकालीन संपर्क सहेजें।', 'त्वरित उपयोगासाठी आपल्या फोनमध्ये आपत्कालीन संपर्क जतन करा.')}</li>
          </ul>
        </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('FAQ', 'सामान्य प्रश्न', 'नेहमी विचारले जाणारे प्रश्न')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="aarti">
                <AccordionTrigger>{t('What are today’s aarti timings?', 'आज की आरती के समय क्या हैं?', 'आजच्या आरतीच्या वेळा काय आहेत?')}</AccordionTrigger>
                <AccordionContent>{t('Open Chat and ask “What’s today’s aarti schedule?”.', 'चैट खोलें और पूछें “आज की आरती का समय क्या है?”.', 'चॅट उघडा आणि विचारा “आजच्या आरतीच्या वेळा?”.')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="emergency">
                <AccordionTrigger>{t('Who do I contact in an emergency?', 'आपात स्थिति में किससे संपर्क करूं?', 'आपत्कालीन परिस्थितीत कोणाशी संपर्क करायचा?')}</AccordionTrigger>
                <AccordionContent>{t('Use Contact Support for helpline numbers and the nearest help desk.', 'हेल्पलाइन नंबर और निकटतम हेल्प डेस्क के लिए संपर्क सहायता का उपयोग करें।', 'हेल्पलाइन क्रमांक आणि जवळच्या हेल्प डेस्कसाठी संपर्क सहाय्य वापरा.')}</AccordionContent>
              </AccordionItem>
            <AccordionItem value="separated">
              <AccordionTrigger>{t('What should I do if I get separated from my group?', 'यदि मैं अपने समूह से बिछड़ जाऊँ तो क्या करूँ?', 'मी माझ्या समूहापासून वेगळा पडलो तर काय करावे?')}</AccordionTrigger>
              <AccordionContent>{t('Go to the nearest help desk shown in the app and share your name, phone, and the last landmark where you met your group.', 'एप में दिखाए गए निकटतम हेल्प डेस्क पर जाएं और अपना नाम, फोन और वह स्थान बताएं जहाँ आप आखिरी बार समूह से मिले थे।', 'अ‍ॅपमध्ये दाखवलेल्या जवळच्या मदत केंद्रावर जा आणि तुमचे नाव, फोन आणि जिथे तुम्ही शेवटचे समूहाला भेटलात ते ठिकाण सांगा.')}</AccordionContent>
            </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;



