
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LostPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Eye
} from 'lucide-react';

interface LostReportDetailsProps {
  report: LostPersonReport;
  onStatusChange: (reportId: string, newStatus: LostPersonReport['status']) => void;
  onEdit: (report: LostPersonReport) => void;
  onClose: () => void;
}

const LostReportDetails: React.FC<LostReportDetailsProps> = ({
  report,
  onStatusChange,
  onEdit,
  onClose
}) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Photo Section */}
        <div className="flex-shrink-0">
          {report.photo ? (
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-lg overflow-hidden border-2 border-gray-200 mx-auto lg:mx-0">
              <img 
                src={report.photo} 
                alt={report.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-gray-200 mx-auto lg:mx-0">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="text-gray-500 text-sm">
                  {getLocalizedText("No Photo", "कोई फोटो नहीं", "फोटो नाही")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{report.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Age", "उम्र", "वय")}</p>
              <p className="font-semibold text-lg">{report.age} {getLocalizedText("years", "वर्ष", "वर्षे")}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Gender", "लिंग", "लिंग")}</p>
              <p className="font-semibold text-lg">
                {report.gender === 'male' && getLocalizedText("Male", "पुरुष", "पुरुष")}
                {report.gender === 'female' && getLocalizedText("Female", "महिला", "स्त्री")}
                {report.gender === 'other' && getLocalizedText("Other", "अन्य", "इतर")}
              </p>
            </div>
            {report.category && (
              <div>
                <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Category", "श्रेणी", "श्रेणी")}</p>
                <p className="font-semibold text-lg">
                  {report.category === 'child' && getLocalizedText("Child", "बच्चा", "बालक")}
                  {report.category === 'adult' && getLocalizedText("Adult", "वयस्क", "प्रौढ")}
                  {report.category === 'elderly' && getLocalizedText("Elderly", "बुजुर्ग", "वृद्ध")}
                  {report.category === 'disabled' && getLocalizedText("Disabled", "विकलांग", "दिव्यांग")}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Status", "स्थिति", "स्थिती")}</p>
              <p className="font-semibold text-lg">
                {report.status === 'pending' && getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}
                {report.status === 'under_review' && getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}
                {report.status === 'found' && getLocalizedText("Found", "मिल गया", "सापडले")}
                {report.status === 'closed' && getLocalizedText("Closed", "बंद", "बंद")}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Last Seen Location", "आखिरी बार देखे जाने का स्थान", "शेवटचं दिसलेलं ठिकाण")}</p>
              <p className="font-semibold">{report.lastSeenLocation}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Clothing", "कपड़े", "कपडे")}</p>
              <p className="font-semibold">{report.clothing}</p>
            </div>
            {report.notes && (
              <div>
                <p className="text-gray-500 text-sm font-medium">{getLocalizedText("Additional Notes", "अतिरिक्त नोट्स", "अतिरिक्त टिपा")}</p>
                <p className="font-semibold bg-gray-50 p-3 rounded-md">{report.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          {getLocalizedText("Update Status", "स्थिति अपडेट करें", "स्थिती अद्यतनित करा")}
        </h3>
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant="outline"
            onClick={() => onStatusChange(report.id, 'under_review')}
            disabled={report.status === 'under_review'}
            className="flex items-center"
          >
            <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
            {getLocalizedText("Mark Under Review", "समीक्षा अधीन करें", "समीक्षेखाली मार्क करा")}
          </Button>
          <Button 
            variant="outline"
            onClick={() => onStatusChange(report.id, 'found')}
            disabled={report.status === 'found'}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            {getLocalizedText("Mark as Found", "मिल गया मार्क करें", "सापडले म्हणून मार्क करा")}
          </Button>
          <Button 
            variant="outline"
            onClick={() => onStatusChange(report.id, 'closed')}
            disabled={report.status === 'closed'}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <XCircle className="h-4 w-4 mr-2 text-gray-500" />
            {getLocalizedText("Close Report", "रिपोर्ट बंद करें", "अहवाल बंद करा")}
          </Button>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => onClose()}
            className="px-6"
          >
            <Eye className="h-4 w-4 mr-2" />
            {getLocalizedText("Close", "बंद करें", "बंद करा")}
          </Button>
          <Button 
            onClick={() => {
              onEdit(report);
              onClose();
            }}
            className="bg-pilgrim-orange text-white hover:bg-orange-600 px-6"
          >
            <Edit className="h-4 w-4 mr-2" />
            {getLocalizedText("Update", "अपडेट", "अपडेट")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LostReportDetails;
