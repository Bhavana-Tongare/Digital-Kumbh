
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoundPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, FileEdit, MapPin, Calendar, User } from 'lucide-react';

interface FoundReportCardProps {
  report: FoundPersonReport;
  onViewDetails: (report: FoundPersonReport) => void;
  onEditReport?: (report: FoundPersonReport) => void;
  onStatusChange: (reportId: string, newStatus: FoundPersonReport['status'], type: 'found') => void;
  formatDate: (date: Date) => string;
}

const FoundReportCard: React.FC<FoundReportCardProps> = ({
  report,
  onViewDetails,
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित"), variant: "secondary" as const },
      under_review: { label: getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली"), variant: "default" as const },
      matched: { label: getLocalizedText("Matched", "मिलान", "जुळले"), variant: "default" as const },
      closed: { label: getLocalizedText("Closed", "बंद", "बंद"), variant: "outline" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={status === 'matched' ? 'bg-green-100 text-green-800' : ''}>{config.label}</Badge>;
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {report.photo && (
        <img
          src={report.photo}
          alt={report.name || 'Found person'}
          className="absolute top-3 right-3 w-12 h-12 rounded-md object-cover border border-white shadow"
        />
      )}
      {report.photo ? (
        <img 
          src={report.photo} 
          alt={report.name || 'Found person'} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {report.name || getLocalizedText("Unknown Person", "अज्ञात व्यक्ति", "अज्ञात व्यक्ती")}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> 
            {report.foundLocation.length > 30 
              ? `${report.foundLocation.substring(0, 30)}...` 
              : report.foundLocation
            }
          </p>
          <p className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" /> 
            {formatDate(report.foundTime)}
          </p>
          <div className="mt-2">
            {getStatusBadge(report.status)}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(report)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {getLocalizedText("Details", "विवरण", "तपशील")}
          </Button>
          
          {onEditReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditReport(report)}
              className="text-pilgrim-orange hover:text-pilgrim-orangeDark hover:bg-orange-50"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              {getLocalizedText("Update", "अपडेट", "अपडेट")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoundReportCard;
