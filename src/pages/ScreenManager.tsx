
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// removed rotation controls
import { Checkbox } from '@/components/ui/checkbox';
import { Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ScreenManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [lostPersonReports, setLostPersonReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "Digital Screen Manager",
    "डिजिटल स्क्रीन प्रबंधक",
    "डिजिटल स्क्रीन व्यवस्थापक"
  );

  const screens = [
    { id: 'screen-1', name: getLocalizedText('Main Entrance', 'मुख्य प्रवेश द्वार', 'मुख्य प्रवेशद्वार'), location: 'Gate 1', status: 'online', type: 'LED' },
    { id: 'screen-2', name: getLocalizedText('Food Court', 'खाद्य क्षेत्र', 'अन्न परिसर'), location: 'Area B', status: 'online', type: 'LCD' },

    { id: 'screen-4', name: getLocalizedText('Bus Terminal', 'बस टर्मिनल', 'बस स्थानक'), location: 'Terminal 2', status: 'online', type: 'LCD' },
    { id: 'screen-5', name: getLocalizedText('Temple Area', 'मंदिर क्षेत्र', 'मंदिर परिसर'), location: 'Block C', status: 'online', type: 'LED' },
  ];

  const [blinkEffect, setBlinkEffect] = useState(true);
  const [displayAllLost, setDisplayAllLost] = useState<boolean>(false);

  useEffect(() => {
    fetchLostPersonReports();
  }, []);

  const fetchLostPersonReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lost_person_reports')
        .select('*')
        .eq('status', 'under_review')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLostPersonReports(data || []);
    } catch (error) {
      console.error('Error fetching lost person reports:', error);
      toast({
        title: "Error",
        description: "Failed to load lost person reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleControlClick = (screenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScreen(screenId);
  };

  const handleApplyToScreen = async () => {
    if (!selectedScreen) {
      toast({ title: "Selection Required", description: "Please select a screen", variant: "destructive" });
      return;
    }
    const copyText = async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch {}
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    };

    if (displayAllLost) {
      const screen = screens.find(s => s.id === selectedScreen);
      const params = new URLSearchParams({ screen_id: selectedScreen, mode: 'all_lost', interval: '30', blink: blinkEffect ? '1' : '0' });
      const url = `${window.location.origin}/screen-display?${params.toString()}`;
      const ok = await copyText(url);
      try { sessionStorage.setItem('lastDisplayUrl', url); } catch {}
      if (ok) {
        toast({
          title: getLocalizedText("Playlist URL copied", "प्लेलिस्ट URL कॉपी", "प्लेलिस्ट URL कॉपी"),
          description: getLocalizedText(
            `Open on display: ${url}`,
            `डिस्प्ले पर खोलें: ${url}`,
            `डिस्प्लेवर उघडा: ${url}`
          )
        });
      } else {
        toast({ title: getLocalizedText("URL Ready", "URL तैयार", "URL तयार"), description: url });
      }
      return;
    }
    if (!selectedReportId) {
      toast({ title: "Selection Required", description: "Please select a report", variant: "destructive" });
      return;
    }
    const screen = screens.find(s => s.id === selectedScreen);
    const report = lostPersonReports.find(r => r.id === selectedReportId);
    try {
      const { error } = await supabase
        .from('screen_displays')
        .upsert({
          screen_id: selectedScreen,
          screen_name: screen?.name || '',
          report_id: selectedReportId,
        }, { onConflict: 'screen_id' });
      if (error) throw error;
      const params = new URLSearchParams({ screen_id: selectedScreen });
      const url = `${window.location.origin}/screen-display?${params.toString()}`;
      const ok = await copyText(url);
      try { sessionStorage.setItem('lastDisplayUrl', url); } catch {}
      if (ok) {
        toast({ title: getLocalizedText("Display URL copied", "डिस्प्ले URL कॉपी", "डिस्प्ले URL कॉपी"), description: url });
      } else {
        toast({ title: getLocalizedText("Display URL", "डिस्प्ले URL", "डिस्प्ले URL"), description: url });
      }
    } catch (error) {
      console.error('Error applying report to screen:', error);
      toast({ title: "Error", description: "Failed to apply report to screen", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title={pageTitle}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-2/3">
            <CardHeader>
              <CardTitle>
                {getLocalizedText("Digital Screens", "डिजिटल स्क्रीन", "डिजिटल स्क्रीन्स")}
              </CardTitle>
              <CardDescription>
                {getLocalizedText(
                  "Manage and control all digital displays",
                  "सभी डिजिटल डिस्प्ले का प्रबंधन और नियंत्रण करें",
                  "सर्व डिजिटल डिस्प्ले व्यवस्थापित आणि नियंत्रित करा"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getLocalizedText("Name", "नाम", "नाव")}</TableHead>
                    <TableHead>{getLocalizedText("Location", "स्थान", "स्थान")}</TableHead>
                    <TableHead>{getLocalizedText("Type", "प्रकार", "प्रकार")}</TableHead>
                    <TableHead>{getLocalizedText("Status", "स्थिति", "स्थिती")}</TableHead>
                    <TableHead>{getLocalizedText("Action", "कार्रवाई", "कृती")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screens.map((screen) => (
                    <TableRow 
                      key={screen.id} 
                      className={selectedScreen === screen.id ? "bg-accent/50" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{screen.name}</div>
                      </TableCell>
                      <TableCell>{screen.location}</TableCell>
                      <TableCell>{screen.type}</TableCell>
                      <TableCell>
                        <Badge variant={screen.status === 'online' ? 'default' : 'outline'} className={screen.status === 'online' ? 'bg-green-500' : ''}>
                          {screen.status === 'online' 
                            ? getLocalizedText("Online", "ऑनलाइन", "ऑनलाइन")
                            : getLocalizedText("Offline", "ऑफलाइन", "ऑफलाइन")
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            disabled={screen.status !== 'online'}
                            onClick={(e) => handleControlClick(screen.id, e)}
                            variant={selectedScreen === screen.id ? "default" : "outline"}
                          >
                            {getLocalizedText("Control", "नियंत्रण", "नियंत्रण")}
                          </Button>
                          {/* Get URL button removed */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                {getLocalizedText("Refresh Status", "स्थिति रीफ्रेश करें", "स्थिती रीफ्रेश करा")}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="md:w-1/3">
            <CardHeader>
              <CardTitle>
                {getLocalizedText("Screen Preview", "स्क्रीन प्रीव्यू", "स्क्रीन प्रीव्ह्यू")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedScreen ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 aspect-video bg-gray-100 flex flex-col items-center justify-center relative">
                    <Monitor className="h-12 w-12 text-gray-400" />
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-white">
                        {screens.find(s => s.id === selectedScreen)?.name}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">
                      {getLocalizedText("Display Settings", "डिस्प्ले सेटिंग्स", "डिस्प्ले सेटिंग्स")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="blink-effect" className="flex-1">
                          {getLocalizedText("Blink Effect", "ब्लिंक इफेक्ट", "ब्लिंक इफेक्ट")}
                        </Label>
                        <Switch 
                          id="blink-effect" 
                          checked={blinkEffect}
                          onCheckedChange={setBlinkEffect}
                        />
                      </div>
                      
                      {/* Rotation speed controls removed */}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Label htmlFor="display-all" className="flex-1">
                          {getLocalizedText("Display all lost reports (playlist)", "सभी लापता रिपोर्ट दिखाएँ (प्लेलिस्ट)", "सर्व हरवलेले अहवाल दाखवा (प्लेलिस्ट)")}
                        </Label>
                        <Switch
                          id="display-all"
                          checked={displayAllLost}
                          onCheckedChange={setDisplayAllLost}
                        />
                      </div>
                    </div>
                  </div>

                {/* Display URL section removed */}

                  <Button 
                    className="w-full" 
                    disabled={screens.find(s => s.id === selectedScreen)?.status !== 'online' || (!displayAllLost && !selectedReportId)}
                    onClick={handleApplyToScreen}
                  >
                    {getLocalizedText("Apply to Screen", "स्क्रीन पर लागू करें", "स्क्रीनवर लागू करा")}
                  </Button>

                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-3">
                      {getLocalizedText("Lost Person Reports", "खोए हुए व्यक्ति रिपोर्ट", "हरवलेल्या व्यक्तींचे अहवाल")}
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {isLoading ? (
                        <p className="text-sm text-muted-foreground">
                          {getLocalizedText("Loading reports...", "रिपोर्ट लोड हो रही हैं...", "अहवाल लोड होत आहेत...")}
                        </p>
                      ) : lostPersonReports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {getLocalizedText("No reports available", "कोई रिपोर्ट उपलब्ध नहीं", "कोणतेही अहवाल उपलब्ध नाहीत")}
                        </p>
                      ) : (
                        lostPersonReports.map((report) => (
                          <div 
                            key={report.id} 
                            className="flex items-start space-x-3 p-2 border rounded hover:bg-accent/50 cursor-pointer"
                            onClick={() => setSelectedReportId(report.id)}
                          >
                            <Checkbox 
                              checked={selectedReportId === report.id}
                              onCheckedChange={(checked) => {
                                setSelectedReportId(checked ? report.id : null);
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {report.photo && (
                                  <img 
                                    src={report.photo} 
                                    alt={report.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{report.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {getLocalizedText("Age", "उम्र", "वय")}: {report.age} | {report.gender}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {report.last_seen_location}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Monitor className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {getLocalizedText(
                      "Select a screen to manage content",
                      "सामग्री प्रबंधित करने के लिए एक स्क्रीन चुनें",
                      "सामग्री व्यवस्थापित करण्यासाठी स्क्रीन निवडा"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </DashboardLayout>
  );
};

export default ScreenManager;
