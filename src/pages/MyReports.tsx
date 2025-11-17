import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LostPersonReport, FoundPersonReport } from '@/types';
import UpdateReportForm from '@/components/reports/UpdateReportForm';
import AuthorityChatDialog from '@/components/reports/AuthorityChatDialog';
import FoundByAuthorityCard from '@/components/reports/FoundByAuthorityCard';
import { Eye, FileEdit, MapPin, Calendar, Loader2, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const MyReports = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lostReports, setLostReports] = useState<LostPersonReport[]>([]);
  const [foundReports, setFoundReports] = useState<FoundPersonReport[]>([]);
  const [selectedLostReport, setSelectedLostReport] = useState<LostPersonReport | null>(null);
  const [selectedFoundReport, setSelectedFoundReport] = useState<FoundPersonReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatReport, setChatReport] = useState<LostPersonReport | null>(null);
  const [activeTab, setActiveTab] = useState('lost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReports();
      
      const channel = supabase
        .channel('report-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'lost_person_reports',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Report updated:', payload);
            fetchReports();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, isUpdateOpen]);

  const fetchReports = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: lostData, error: lostError } = await supabase
        .from('lost_person_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (lostError) {
        console.error('Error fetching lost reports:', lostError);
        throw lostError;
      }

      const transformedLostReports = lostData?.map(report => ({
        id: report.id,
        name: report.name,
        age: report.age,
        gender: report.gender as 'male' | 'female' | 'other',
        photo: report.photo,
        clothing: report.clothing,
        lastSeenLocation: report.last_seen_location,
        lastSeenTime: new Date(report.last_seen_time),
        category: report.category as 'child' | 'elderly' | 'disabled' | 'adult' | undefined,
        status: report.status as LostPersonReport['status'],
        notes: report.notes,
        reporterId: report.user_id,
        createdAt: new Date(report.created_at),
        updatedAt: new Date(report.updated_at),
        authorityId: report.authority_id,
        authorityName: report.authority_name,
        authorityPhone: report.authority_phone,
        authorityAssignedAt: report.authority_assigned_at ? new Date(report.authority_assigned_at) : undefined,
        foundBy: (report as any).found_by || null
      })) || [];

      setLostReports(transformedLostReports);

      try {
        const { data: foundData, error: foundError } = await supabase
          .from('found_person_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (foundError) {
          console.error('Error fetching found reports:', foundError);
        } else {
          const transformedFoundReports = foundData?.map(report => ({
            id: report.id,
            name: report.name,
            age: report.age,
            gender: report.gender as 'male' | 'female' | 'other' | undefined,
            photo: report.photo,
            clothing: report.clothing,
            foundLocation: report.found_location,
            foundTime: new Date(report.found_time),
            category: report.category as 'child' | 'elderly' | 'disabled' | 'adult' | undefined,
            status: report.status as FoundPersonReport['status'],
            notes: report.notes,
            foundById: report.user_id,
            createdAt: new Date(report.created_at),
            updatedAt: new Date(report.updated_at)
          })) || [];

          setFoundReports(transformedFoundReports);
        }
      } catch (foundTableError) {
        console.log('Found reports table may not exist yet');
        setFoundReports([]);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: getLocalizedText(
          "Error loading reports",
          "रिपोर्ट लोड करने में त्रुटि",
          "अहवाल लोड करताना त्रुटी"
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleViewLostDetails = (report: LostPersonReport) => {
    setSelectedLostReport(report);
    setSelectedFoundReport(null);
    setIsDetailsOpen(true);
  };
  
  const handleViewFoundDetails = (report: FoundPersonReport) => {
    setSelectedFoundReport(report);
    setSelectedLostReport(null);
    setIsDetailsOpen(true);
  };

  const handleUpdateLost = (report: LostPersonReport) => {
    setSelectedLostReport(report);
    setIsUpdateOpen(true);
  };

  const handleChatWithAuthority = (report: LostPersonReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatReport(report);
    setIsChatOpen(true);
  };

  const handleMarkAsFound = async (report: LostPersonReport, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('lost_person_reports')
        .update({ status: 'found' })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: getLocalizedText(
          "Report marked as found",
          "रिपोर्ट मिल गई के रूप में चिह्नित",
          "अहवाल सापडल्याचे चिन्हांकित केले"
        ),
        description: getLocalizedText(
          "The report status has been updated to found",
          "रिपोर्ट की स्थिति मिल गई में अपडेट कर दी गई है",
          "अहवाल स्थिती सापडले मध्ये अद्यतनित केली आहे"
        ),
      });

      fetchReports();
    } catch (error) {
      console.error('Error marking report as found:', error);
      toast({
        title: getLocalizedText(
          "Error updating report",
          "रिपोर्ट अपडेट करने में त्रुटि",
          "अहवाल अपडेट करताना त्रुटी"
        ),
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title={getLocalizedText("My Reports", "मेरी रिपोर्ट", "माझे अहवाल")}>
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
    <DashboardLayout title={getLocalizedText("My Reports", "मेरी रिपोर्ट", "माझे अहवाल")}>
      <Tabs defaultValue="lost" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="lost">
            {getLocalizedText("Lost Person Reports", "लापता व्यक्ति रिपोर्ट", "हरवलेल्या व्यक्तीचे अहवाल")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lost" className="mt-6">
          {lostReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {getLocalizedText(
                  "You haven't submitted any lost person reports yet",
                  "आपने अभी तक कोई लापता व्यक्ति रिपोर्ट जमा नहीं की है",
                  "तुम्ही अजून कोणताही हरवलेल्या व्यक्तीचा अहवाल सादर केलेला नाही"
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  {report.photo ? (
                    <img 
                      src={report.photo} 
                      alt={report.name} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
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
                      <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full inline-block mt-1">
                        {report.status === 'pending' && getLocalizedText("Pending", "प्रतीक्षित", "प्रलंबित")}
                        {report.status === 'under_review' && getLocalizedText("Under Review", "समीक्षा अधीन", "समीक्षेखाली")}
                        {report.status === 'found' && getLocalizedText("Found", "मिल गया", "सापडले")}
                        {report.status === 'closed' && getLocalizedText("Closed", "बंद", "बंद")}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLostDetails(report)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {getLocalizedText("Details", "विवरण", "तपशील")}
                      </Button>
                      
                      {report.status === 'found' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleChatWithAuthority(report, e)}
                          className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {getLocalizedText("Chat", "चैट", "चॅट")}
                        </Button>
                      ) : report.status === 'under_review' ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => handleMarkAsFound(report, e)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {getLocalizedText("Found", "मिल गया", "सापडले")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateLost(report)}
                          className="flex-1 text-pilgrim-orange hover:text-pilgrim-orangeDark hover:bg-orange-50"
                        >
                          <FileEdit className="w-4 h-4 mr-2" />
                          {getLocalizedText("Update", "अपडेट", "अपडेट")}
                        </Button>
                      )}
                    </div>

                    {report.status === 'found' && report.foundBy && (
                      <div className="mt-4">
                        <FoundByAuthorityCard foundBy={report.foundBy} />
                      </div>
                    )}

                    {report.status === 'found' && !report.foundBy && report.authorityName && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          {getLocalizedText("👮 Authority Details:", "👮 संपर्क अधिकारी:", "👮 संपर्क अधिकारी:")}
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>{getLocalizedText("Name:", "नाम:", "नाव:")}</strong> {report.authorityName}
                        </p>
                        {report.authorityPhone && (
                          <p className="text-sm text-green-700 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <strong>{getLocalizedText("Phone:", "फोन:", "फोन:")}</strong> {report.authorityPhone}
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-2 italic">
                          {getLocalizedText(
                            "Contact the authority for coordination regarding your found person.",
                            "अपने पाए गए व्यक्ति के संबंध में समन्वय के लिए अधिकारी से संपर्क करें।",
                            "तुमच्या सापडलेल्या व्यक्तीबद्दल समन्वयासाठी अधिकाऱ्याशी संपर्क साधा."
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Found Person Reports tab removed for user dashboard */}
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLostReport && (
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedLostReport.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">{getLocalizedText("Age", "उम्र", "वय")}</p>
                    <p className="font-medium">{selectedLostReport.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{getLocalizedText("Gender", "लिंग", "लिंग")}</p>
                    <p className="font-medium">{selectedLostReport.gender}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">{getLocalizedText("Last Seen Location", "आखिरी बार देखे जाने का स्थान", "शेवटचं दिसलेलं ठिकाण")}</p>
                    <p className="font-medium">{selectedLostReport.lastSeenLocation}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">{getLocalizedText("Clothing", "कपड़े", "कपडे")}</p>
                    <p className="font-medium">{selectedLostReport.clothing}</p>
                  </div>
                  {selectedLostReport.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-500">{getLocalizedText("Additional Notes", "अतिरिक्त नोट्स", "अतिरिक्त टिपा")}</p>
                      <p className="font-medium">{selectedLostReport.notes}</p>
                    </div>
                  )}
                </div>
                
                {selectedLostReport.status === 'found' && selectedLostReport.foundBy && (
                  <div className="mt-6">
                    <FoundByAuthorityCard foundBy={selectedLostReport.foundBy} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {selectedFoundReport && (
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedFoundReport.name || getLocalizedText("Unknown Person", "अज्ञात व्यक्ति", "अज्ञात व्यक्ति")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {selectedFoundReport.age && (
                    <div>
                      <p className="text-gray-500">{getLocalizedText("Age", "उम्र", "वय")}</p>
                      <p className="font-medium">{selectedFoundReport.age}</p>
                    </div>
                  )}
                  {selectedFoundReport.gender && (
                    <div>
                      <p className="text-gray-500">{getLocalizedText("Gender", "लिंग", "लिंग")}</p>
                      <p className="font-medium">{selectedFoundReport.gender}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-500">{getLocalizedText("Found Location", "मिलने का स्थान", "सापडलेले ठिकाण")}</p>
                    <p className="font-medium">{selectedFoundReport.foundLocation}</p>
                  </div>
                  {selectedFoundReport.clothing && (
                    <div className="col-span-2">
                      <p className="text-gray-500">{getLocalizedText("Clothing", "कपड़े", "कपडे")}</p>
                      <p className="font-medium">{selectedFoundReport.clothing}</p>
                    </div>
                  )}
                  {selectedFoundReport.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-500">{getLocalizedText("Additional Notes", "अतिरिक्त नोट्स", "अतिरिक्त टिपा")}</p>
                      <p className="font-medium">{selectedFoundReport.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {selectedLostReport && (
        <UpdateReportForm
          report={selectedLostReport}
          open={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
        />
      )}

      {chatReport && (
        <AuthorityChatDialog
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatReport(null);
          }}
          report={chatReport}
        />
      )}
    </DashboardLayout>
  );
};

export default MyReports;
