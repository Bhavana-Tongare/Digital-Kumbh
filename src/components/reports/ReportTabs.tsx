
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LostReportTable from '@/components/reports/LostReportTable';
import FoundReportTable from '@/components/reports/FoundReportTable';
import { LostPersonReport, FoundPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ReportTabsProps {
  filteredLostReports: LostPersonReport[];
  filteredFoundReports: FoundPersonReport[];
  onViewLostDetails: (report: LostPersonReport) => void;
  onViewFoundDetails: (report: FoundPersonReport) => void;
  onEditReport: (report: LostPersonReport) => void;
  onStatusChange: (reportId: string, newStatus: string, type: 'lost' | 'found') => void;
  formatDate: (date: Date) => string;
}

const ReportTabs: React.FC<ReportTabsProps> = ({
  filteredLostReports,
  filteredFoundReports,
  onViewLostDetails,
  onViewFoundDetails,
  onEditReport,
  onStatusChange,
  formatDate
}) => {
  const { language } = useLanguage();
  
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <Tabs defaultValue="lost" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="lost">
          {getLocalizedText("Lost Person Reports", "लापता व्यक्ति रिपोर्ट", "हरवलेल्या व्यक्तीचे अहवाल")}
        </TabsTrigger>
        <TabsTrigger value="found">
          {getLocalizedText("Found Person Reports", "मिले हुए व्यक्ति रिपोर्ट", "सापडलेल्या व्यक्तीचे अहवाल")}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="lost" className="mt-6">
        <LostReportTable 
          reports={filteredLostReports}
          onViewDetails={onViewLostDetails}
          onEditReport={onEditReport}
          onStatusChange={(reportId, newStatus) => onStatusChange(reportId, newStatus, 'lost')}
          formatDate={formatDate}
        />
      </TabsContent>
      
      <TabsContent value="found" className="mt-6">
        <FoundReportTable 
          reports={filteredFoundReports}
          onViewDetails={onViewFoundDetails}
          onStatusChange={(reportId, newStatus) => onStatusChange(reportId, newStatus, 'found')}
          formatDate={formatDate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;
