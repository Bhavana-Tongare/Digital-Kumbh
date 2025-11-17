
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useReportManagement } from '@/hooks/useReportManagement';
import StatusFilter from '@/components/reports/StatusFilter';
import UpdateReportForm from '@/components/reports/UpdateReportForm';
import ReportDetailsDialog from '@/components/reports/ReportDetailsDialog';
import AuthorityReportCard from '@/components/reports/AuthorityReportCard';
import FoundReportCard from '@/components/reports/FoundReportCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';

const ManageReports: React.FC = () => {
  const { language } = useLanguage();
  const {
    lostReports,
    foundReports,
    selectedLostReport,
    selectedFoundReport,
    isDetailsOpen,
    selectedStatus,
    isUpdateFormOpen,
    filteredLostReports,
    filteredFoundReports,
    loading,
    formatDate,
    handleViewLostDetails,
    handleViewFoundDetails,
    handleEditReport,
    handleStatusChange,
    setSelectedStatus,
    setIsDetailsOpen,
    handleUpdateFormClose
  } = useReportManagement();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Filter lost reports to show only those that are NOT found
  const activeLostReports = filteredLostReports.filter(report => report.status !== 'found');
  
  // Create a combined found reports list that includes both:
  // 1. Original found person reports
  // 2. Lost person reports that have been marked as found
  const foundLostReports = filteredLostReports.filter(report => report.status === 'found');
  const combinedFoundReports = [...filteredFoundReports, ...foundLostReports];

  if (loading) {
    return (
      <DashboardLayout title={getLocalizedText("Lost and Found Reports", "सभी लापता और मिले हुए रिपोर्ट", "सर्व हरवलेले आणि सापडलेले अहवाल")}>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">
            {getLocalizedText("Loading reports...", "रिपोर्ट लोड हो रही हैं...", "अहवाल लोड होत आहेत...")}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getLocalizedText("Lost and Found Reports", "सभी लापता और मिले हुए रिपोर्ट", "सर्व हरवलेले आणि सापडलेले अहवाल")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <StatusFilter value={selectedStatus} onChange={setSelectedStatus} />
          
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
            Active Lost: {activeLostReports.length} | Found: {combinedFoundReports.length} | Filter: {selectedStatus}
          </div>
        </div>
        
        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">
              {getLocalizedText("Active Lost Reports", "सक्रिय लापता रिपोर्ट", "सक्रिय हरवलेल्या अहवाल")} ({activeLostReports.length})
            </TabsTrigger>
            <TabsTrigger value="found">
              {getLocalizedText("Found Person Reports", "मिले हुए व्यक्ति रिपोर्ट", "सापडलेल्या व्यक्तीचे अहवाल")} ({combinedFoundReports.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lost" className="mt-6">
            {lostReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getLocalizedText(
                    "No lost person reports found",
                    "कोई लापता व्यक्ति रिपोर्ट नहीं मिली",
                    "कोणतेही हरवलेल्या व्यक्तीचे अहवाल सापडले नाहीत"
                  )}
                </h3>
                <p className="text-gray-500">
                  {getLocalizedText(
                    "Reports will appear here once they are submitted through the system",
                    "सिस्टम के माध्यम से रिपोर्ट जमा होने पर वे यहाँ दिखाई जाएंगी",
                    "सिस्टमद्वारे अहवाल सबमिट झाल्यावर ते येथे दिसतील"
                  )}
                </p>
              </div>
            ) : activeLostReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {selectedStatus === 'found' ? (
                    getLocalizedText(
                      "All matching reports have been moved to the Found section",
                      "सभी मैचिंग रिपोर्ट्स को Found सेक्शन में स्थानांतरित कर दिया गया है",
                      "सर्व जुळणारे अहवाल Found विभागात हलवले गेले आहेत"
                    )
                  ) : (
                    getLocalizedText(
                      `No active lost person reports with status "${selectedStatus}"`,
                      `"${selectedStatus}" स्थिति वाली कोई सक्रिय लापता व्यक्ति रिपोर्ट नहीं मिली`,
                      `"${selectedStatus}" स्थितीसह कोणतेही सक्रिय हरवलेल्या व्यक्तीचे अहवाल सापडले नाहीत`
                    )
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLostReports.map((report) => (
                  <AuthorityReportCard
                    key={report.id}
                    report={report}
                    onViewDetails={handleViewLostDetails}
                    onEditReport={handleEditReport}
                    onStatusChange={handleStatusChange}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="found" className="mt-6">
            {combinedFoundReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getLocalizedText(
                    "No found person reports",
                    "कोई मिले हुए व्यक्ति रिपोर्ट नहीं मिली",
                    "कोणतेही सापडलेल्या व्यक्तीचे अहवाल नाहीत"
                  )}
                </h3>
                <p className="text-gray-500">
                  {getLocalizedText(
                    "Reports will appear here when people are found or when lost reports are marked as found",
                    "जब लोग मिल जाते हैं या जब लापता रिपोर्ट्स को found मार्क किया जाता है तो रिपोर्ट्स यहाँ दिखाई जाएंगी",
                    "जेव्हा लोक सापडतात किंवा हरवलेले अहवाल सापडलेले म्हणून चिन्हांकित केले जातात तेव्हा अहवाल येथे दिसतील"
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combinedFoundReports.map((report) => {
                  // Check if this is a found lost report or a regular found report
                  const isFoundLostReport = 'lastSeenLocation' in report;
                  
                  if (isFoundLostReport) {
                    // This is a lost report that was marked as found
                    return (
                      <AuthorityReportCard
                        key={report.id}
                        report={report}
                        onViewDetails={handleViewLostDetails}
                        onEditReport={handleEditReport}
                        onStatusChange={handleStatusChange}
                        formatDate={formatDate}
                      />
                    );
                  } else {
                    // This is a regular found person report
                    return (
                      <FoundReportCard
                        key={report.id}
                        report={report}
                        onViewDetails={handleViewFoundDetails}
                        onStatusChange={handleStatusChange}
                        formatDate={formatDate}
                      />
                    );
                  }
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Details Dialog */}
        <ReportDetailsDialog 
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          selectedLostReport={selectedLostReport}
          selectedFoundReport={selectedFoundReport}
          onStatusChange={handleStatusChange}
          onEditReport={handleEditReport}
        />
        
        {/* Update Report Form Dialog */}
        {selectedLostReport && (
          <UpdateReportForm 
            report={selectedLostReport}
            open={isUpdateFormOpen}
            onClose={handleUpdateFormClose}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageReports;
