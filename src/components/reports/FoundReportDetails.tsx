
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoundPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface FoundReportDetailsProps {
  report: FoundPersonReport;
  onStatusChange: (reportId: string, newStatus: FoundPersonReport['status']) => void;
}

const FoundReportDetails: React.FC<FoundReportDetailsProps> = ({
  report,
  onStatusChange
}) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {report.name || getLocalizedText("Unknown Person", "अज्ञात व्यक्ति", "अज्ञात व्यक्ती")}
        </h2>
        {report.photo && (
          <div className="mb-4">
            <img 
              src={report.photo} 
              alt={report.name || "Unknown"} 
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {report.age && (
            <div>
              <p className="text-gray-500">{getLocalizedText("Age", "उम्र", "वय")}</p>
              <p className="font-medium">{report.age}</p>
            </div>
          )}
          {report.gender && (
            <div>
              <p className="text-gray-500">{getLocalizedText("Gender", "लिंग", "लिंग")}</p>
              <p className="font-medium">
                {report.gender === 'male' && getLocalizedText("Male", "पुरुष", "पुरुष")}
                {report.gender === 'female' && getLocalizedText("Female", "महिला", "स्त्री")}
                {report.gender === 'other' && getLocalizedText("Other", "अन्य", "इतर")}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-500">{getLocalizedText("Status", "स्थिति", "स्थिती")}</p>
            <p className="font-medium">
              {report.status === 'pending' && getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}
              {report.status === 'under_review' && getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}
              {report.status === 'matched' && getLocalizedText("Matched", "मिल गया", "जुळले")}
              {report.status === 'closed' && getLocalizedText("Closed", "बंद", "बंद")}
            </p>
          </div>
          {report.category && (
            <div>
              <p className="text-gray-500">{getLocalizedText("Category", "श्रेणी", "श्रेणी")}</p>
              <p className="font-medium">
                {report.category === 'child' && getLocalizedText("Child", "बच्चा", "बालक")}
                {report.category === 'elderly' && getLocalizedText("Elderly", "बुजुर्ग", "वृद्ध")}
                {report.category === 'disabled' && getLocalizedText("Disabled", "विकलांग", "दिव्यांग")}
                {report.category === 'adult' && getLocalizedText("Adult", "वयस्क", "प्रौढ")}
              </p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-gray-500">{getLocalizedText("Found Location", "मिलने का स्थान", "सापडलेले ठिकाण")}</p>
            <p className="font-medium">{report.foundLocation}</p>
          </div>
          {report.clothing && (
            <div className="col-span-2">
              <p className="text-gray-500">{getLocalizedText("Clothing", "कपड़े", "कपडे")}</p>
              <p className="font-medium">{report.clothing}</p>
            </div>
          )}
          {report.notes && (
            <div className="col-span-2">
              <p className="text-gray-500">{getLocalizedText("Additional Notes", "अतिरिक्त नोट्स", "अतिरिक्त टिपा")}</p>
              <p className="font-medium">{report.notes}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            {getLocalizedText("Update Status", "स्थिति अपडेट करें", "स्थिती अद्यतनित करा")}
          </h3>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => onStatusChange(report.id, 'under_review')}
              disabled={report.status === 'under_review'}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
              {getLocalizedText("Mark Under Review", "समीक्षा अधीन करें", "समीक्षेखाली मार्क करा")}
            </Button>
            <Button 
              variant="outline"
              onClick={() => onStatusChange(report.id, 'matched')}
              disabled={report.status === 'matched'}
              className="text-green-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              {getLocalizedText("Mark as Matched", "मिलान किया मार्क करें", "जुळवले म्हणून मार्क करा")}
            </Button>
            <Button 
              variant="outline"
              onClick={() => onStatusChange(report.id, 'closed')}
              disabled={report.status === 'closed'}
              className="text-gray-600"
            >
              <XCircle className="h-4 w-4 mr-2 text-gray-500" />
              {getLocalizedText("Close Report", "रिपोर्ट बंद करें", "अहवाल बंद करा")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoundReportDetails;
