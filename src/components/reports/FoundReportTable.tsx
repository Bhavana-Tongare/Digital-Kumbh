
import React from 'react';
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
import { FoundPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Search
} from 'lucide-react';

interface FoundReportTableProps {
  reports: FoundPersonReport[];
  onViewDetails: (report: FoundPersonReport) => void;
  onStatusChange: (reportId: string, newStatus: FoundPersonReport['status']) => void;
  formatDate: (date: Date) => string;
}

const FoundReportTable: React.FC<FoundReportTableProps> = ({ 
  reports, 
  onViewDetails, 
  onStatusChange,
  formatDate 
}) => {
  const { language } = useLanguage();
  
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
            "No found person reports available",
            "कोई मिले हुए व्यक्ति रिपोर्ट उपलब्ध नहीं है",
            "कोणतेही सापडलेल्या व्यक्तीचे अहवाल उपलब्ध नाहीत"
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
            <TableHead>{getLocalizedText("Found At", "मिलने की जगह", "सापडण्याची जागा")}</TableHead>
            <TableHead>{getLocalizedText("Date", "दिनांक", "तारीख")}</TableHead>
            <TableHead>{getLocalizedText("Status", "स्थिति", "स्थिती")}</TableHead>
            <TableHead>{getLocalizedText("Actions", "कार्रवाई", "क्रिया")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.name || getLocalizedText("Unknown", "अज्ञात", "अज्ञात")}</TableCell>
              <TableCell>{report.foundLocation}</TableCell>
              <TableCell>{formatDate(report.foundTime)}</TableCell>
              <TableCell>
                <Badge className={
                  report.status === 'pending' ? "bg-yellow-500" :
                  report.status === 'under_review' ? "bg-blue-500" :
                  report.status === 'matched' ? "bg-green-500" :
                  "bg-gray-500"
                }>
                  {report.status === 'pending' && getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}
                  {report.status === 'under_review' && getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}
                  {report.status === 'matched' && getLocalizedText("Matched", "मिल गया", "जुळले")}
                  {report.status === 'closed' && getLocalizedText("Closed", "बंद", "बंद")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onViewDetails(report)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onStatusChange(report.id, 'under_review')}
                    disabled={report.status === 'under_review'}
                  >
                    <Search className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onStatusChange(report.id, 'matched')}
                    disabled={report.status === 'matched'}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onStatusChange(report.id, 'closed')}
                    disabled={report.status === 'closed'}
                  >
                    <XCircle className="h-4 w-4 text-gray-500" />
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

export default FoundReportTable;
