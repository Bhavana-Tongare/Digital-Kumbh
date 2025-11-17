
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LostPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Search,
  Edit
} from 'lucide-react';

interface LostReportTableProps {
  reports: LostPersonReport[];
  onViewDetails: (report: LostPersonReport) => void;
  onEditReport: (report: LostPersonReport) => void;
  onStatusChange: (reportId: string, newStatus: LostPersonReport['status']) => void;
  formatDate: (date: Date) => string;
}

const LostReportTable: React.FC<LostReportTableProps> = ({ 
  reports, 
  onViewDetails, 
  onEditReport, 
  onStatusChange,
  formatDate
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {getLocalizedText(
            "No lost person reports available",
            "कोई लापता व्यक्ति रिपोर्ट उपलब्ध नहीं है",
            "कोणतेही हरवलेल्या व्यक्तीचे अहवाल उपलब्ध नाहीत"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{getLocalizedText("Name", "नाम", "नाव")}</TableHead>
            <TableHead>{getLocalizedText("Age", "उम्र", "वय")}</TableHead>
            <TableHead>{getLocalizedText("Gender", "लिंग", "लिंग")}</TableHead>
            <TableHead>{getLocalizedText("Last Seen", "आखिरी बार देखा गया", "शेवटचे दिसले")}</TableHead>
            <TableHead>{getLocalizedText("Status", "स्थिति", "स्थिती")}</TableHead>
            <TableHead>{getLocalizedText("Actions", "कार्रवाई", "क्रिया")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.name}</TableCell>
              <TableCell>{report.age}</TableCell>
              <TableCell>
                {report.gender === 'male' && getLocalizedText("Male", "पुरुष", "पुरुष")}
                {report.gender === 'female' && getLocalizedText("Female", "महिला", "स्त्री")}
                {report.gender === 'other' && getLocalizedText("Other", "अन्य", "इतर")}
              </TableCell>
              <TableCell>{formatDate(report.lastSeenTime)}</TableCell>
              <TableCell>
                <Badge className={
                  report.status === 'pending' ? "bg-yellow-500" :
                  report.status === 'under_review' ? "bg-blue-500" :
                  report.status === 'found' ? "bg-green-500" :
                  "bg-gray-500"
                }>
                  {report.status === 'pending' && getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}
                  {report.status === 'under_review' && getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}
                  {report.status === 'found' && getLocalizedText("Found", "मिल गया", "सापडले")}
                  {report.status === 'closed' && getLocalizedText("Closed", "बंद", "बंद")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-pilgrim-orange text-white hover:bg-orange-600"
                    onClick={() => onViewDetails(report)} 
                    aria-label={`View details for ${report.name}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {getLocalizedText("View", "देखें", "पाहा")}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-white text-black border hover:bg-gray-100"
                    onClick={() => onEditReport(report)}
                    aria-label={`Edit report for ${report.name}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {getLocalizedText("Update", "अपडेट", "अपडेट")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LostReportTable;
