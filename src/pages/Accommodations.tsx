
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import AccommodationSearch from '@/components/accommodation/AccommodationSearch';

const Accommodations: React.FC = () => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "Accommodation",
    "आवास",
    "निवास"
  );

  return (
    <DashboardLayout title={pageTitle}>
      <AccommodationSearch />
    </DashboardLayout>
  );
};

export default Accommodations;
