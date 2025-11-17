
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LostPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import AuthorityChatDialog from './AuthorityChatDialog';
import FoundByAuthorityCard from './FoundByAuthorityCard';
import { Eye, FileEdit, MapPin, Calendar, MessageCircle, Phone } from 'lucide-react';

interface AuthorityReportCardProps {
  report: LostPersonReport;
  onViewDetails: (report: LostPersonReport) => void;
  onEditReport: (report: LostPersonReport) => void;
  onStatusChange: (reportId: string, newStatus: LostPersonReport['status'], type: 'lost') => void;
  formatDate: (date: Date) => string;
}

const AuthorityReportCard: React.FC<AuthorityReportCardProps> = ({
  report,
  onViewDetails,
  onEditReport,
  onStatusChange,
  formatDate
}) => {
  const { language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित"), variant: "secondary" as const },
      under_review: { label: getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली"), variant: "default" as const },
      found: { label: getLocalizedText("Found", "मिल गया", "सापडले"), variant: "default" as const },
      closed: { label: getLocalizedText("Closed", "बंद", "बंद"), variant: "outline" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={status === 'found' ? 'bg-green-100 text-green-800' : ''}>{config.label}</Badge>;
  };

  const handleChatWithReporter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(getLocalizedText(
      "Do you want to contact the reporter regarding this report?",
      "क्या आप इस रिपोर्ट के बारे में रिपोर्टर से संपर्क करना चाहते हैं?",
      "तुम्हाला या अहवालाबद्दल रिपोर्टरशी संपर्क साधायचा आहे का?"
    ))) {
      setIsChatOpen(true);
    }
  };

  const handleMarkAsFound = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(getLocalizedText(
      "Are you sure you want to mark this person as found?",
      "क्या आप वाकई इस व्यक्ति को मिला हुआ चिह्नित करना चाहते हैं?",
      "तुम्हाला खरोखर ही व्यक्ती सापडली म्हणून चिन्हित करायची आहे का?"
    ))) {
      await onStatusChange(report.id, 'found', 'lost');
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        {report.photo && (
          <img
            src={report.photo}
            alt={report.name}
            className="absolute top-3 right-3 w-20 h-20 rounded-md object-cover border border-white shadow"
          />
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> 
              {report.lastSeenLocation.length > 30 
                ? `${report.lastSeenLocation.substring(0, 30)}...` 
                : report.lastSeenLocation
              }
            </p>
            <p className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> 
              {formatDate(report.lastSeenTime)}
            </p>
            <div className="mt-2">
              {getStatusBadge(report.status)}
            </div>
          </div>

          {/* Reporter Contact Section - Always shown for authorities */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">
              {getLocalizedText("Reporter Contact:", "रिपोर्टर संपर्क:", "रिपोर्टर संपर्क:")}
            </p>
            <p className="text-sm text-blue-700">
              {getLocalizedText("Name:", "नाम:", "नाव:")} {report.reporterName}
            </p>
            {report.reporterPhone && report.reporterPhone !== 'Contact Not Available' && (
              <p className="text-sm text-blue-700 flex items-center mt-1">
                <Phone className="h-3 w-3 mr-1" />
                {report.reporterPhone}
              </p>
            )}
          </div>

          {/* Show authority info if report is found */}
          {report.status === 'found' && report.foundBy && (
            <div className="mt-3">
              <FoundByAuthorityCard foundBy={report.foundBy} />
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(report)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {getLocalizedText("Details", "विवरण", "तपशील")}
            </Button>
            
            {report.status === 'found' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleChatWithReporter}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {getLocalizedText("Chat", "चैट", "चॅट")}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditReport(report)}
                  className="text-pilgrim-orange hover:text-pilgrim-orangeDark hover:bg-orange-50"
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  {getLocalizedText("Update", "अपडेट", "अपडेट")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkAsFound}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {getLocalizedText("Mark Found", "मिला हुआ", "सापडले")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      {isChatOpen && (
        <AuthorityChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          report={report}
        />
      )}
    </>
  );
};

export default AuthorityReportCard;
