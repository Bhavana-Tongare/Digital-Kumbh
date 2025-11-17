
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import LostReportDetails from '@/components/reports/LostReportDetails';
import FoundReportDetails from '@/components/reports/FoundReportDetails';
import { LostPersonReport, FoundPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ReportDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLostReport: LostPersonReport | null;
  selectedFoundReport: FoundPersonReport | null;
  onStatusChange: (reportId: string, newStatus: string, type: 'lost' | 'found') => void;
  onEditReport: (report: LostPersonReport) => void;
}

const ReportDetailsDialog: React.FC<ReportDetailsDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  selectedLostReport,
  selectedFoundReport,
  onStatusChange,
  onEditReport
}) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">
          {getLocalizedText("Report Details", "रिपोर्ट विवरण", "अहवाल तपशील")}
        </DialogTitle>
        
        {selectedLostReport && (
          <LostReportDetails 
            report={selectedLostReport}
            onStatusChange={(reportId, newStatus) => onStatusChange(reportId, newStatus, 'lost')}
            onEdit={onEditReport}
            onClose={() => onOpenChange(false)}
          />
        )}
        
        {selectedFoundReport && (
          <FoundReportDetails 
            report={selectedFoundReport}
            onStatusChange={(reportId, newStatus) => onStatusChange(reportId, newStatus, 'found')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailsDialog;
