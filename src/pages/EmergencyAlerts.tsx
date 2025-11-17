
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertCircle, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  Users,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyAlert {
  id: string;
  alert_id: string;
  user_id: string;
  name: string;
  phone_number: string;
  type: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  status: string;
  created_at: string;
}

const EmergencyAlerts: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "Emergency Alerts",
    "आपातकालीन अलर्ट",
    "आपत्कालीन सूचना"
  );

  // Fetch emergency alerts
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('emergency_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts'
        },
        (payload) => {
          console.log('Real-time alert update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as EmergencyAlert, ...prev]);
            toast({
              title: getLocalizedText("New Emergency Alert", "नया आपातकालीन अलर्ट", "नवीन आपत्कालीन अलर्ट"),
              description: getLocalizedText(
                `Alert ${(payload.new as EmergencyAlert).alert_id} received`,
                `अलर्ट ${(payload.new as EmergencyAlert).alert_id} प्राप्त हुआ`,
                `अलर्ट ${(payload.new as EmergencyAlert).alert_id} प्राप्त झाले`
              ),
            });
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(alert => 
              alert.id === payload.new.id ? payload.new as EmergencyAlert : alert
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ status: 'Resolved' })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as resolved:', error);
        toast({
          title: getLocalizedText("Error", "त्रुटि", "त्रुटी"),
          description: getLocalizedText(
            "Failed to update alert status",
            "अलर्ट स्थिति अपडेट करने में विफल",
            "अलर्ट स्थिती अपडेट करण्यात अयशस्वी"
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: getLocalizedText("Alert Resolved", "अलर्ट हल किया गया", "अलर्ट निराकरण केले"),
        description: getLocalizedText(
          "Alert has been marked as resolved",
          "अलर्ट को हल के रूप में चिह्नित किया गया है",
          "अलर्ट निराकरण केले म्हणून चिन्हांकित केले आहे"
        ),
      });
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'medical': 
      case 'ambulance': 
        return 'bg-red-100 text-red-800';
      case 'police': 
      case 'security': 
        return 'bg-blue-100 text-blue-800';
      case 'fire': 
        return 'bg-orange-100 text-orange-800';
      case 'women': 
      case 'child': 
        return 'bg-pink-100 text-pink-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-red-500' : 'bg-green-500';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ambulance':
      case 'medical':
        return getLocalizedText("Medical", "चिकित्सा", "वैद्यकीय");
      case 'police':
      case 'security':
        return getLocalizedText("Security", "सुरक्षा", "सुरक्षा");
      case 'fire':
        return getLocalizedText("Fire", "अग्निशमन", "अग्निशमन");
      case 'women':
        return getLocalizedText("Women Safety", "महिला सुरक्षा", "महिला सुरक्षा");
      case 'child':
        return getLocalizedText("Child Safety", "बाल सुरक्षा", "बाल सुरक्षा");
      default:
        return getLocalizedText("Emergency", "आपातकाल", "आपत्कालीन");
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return getLocalizedText("Just now", "अभी", "आत्ता");
    } else if (diffInMinutes < 60) {
      return getLocalizedText(`${diffInMinutes} minutes ago`, `${diffInMinutes} मिनट पहले`, `${diffInMinutes} मिनिटांपूर्वी`);
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return getLocalizedText(`${diffInHours} hours ago`, `${diffInHours} घंटे पहले`, `${diffInHours} तासांपूर्वी`);
    }
  };

  const openGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.alert_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'Active');
  const selectedAlertData = alerts.find(alert => alert.id === selectedAlert);

  if (loading) {
    return (
      <DashboardLayout title={pageTitle}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">
            {getLocalizedText("Loading alerts...", "अलर्ट लोड हो रहे हैं...", "अलर्ट लोड होत आहे...")}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={pageTitle}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-2/3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {getLocalizedText("Emergency Alerts", "आपातकालीन अलर्ट", "आपत्कालीन अलर्ट")}
                </CardTitle>
                <Badge variant="destructive" className="ml-2">
                  {activeAlerts.length} 
                  {getLocalizedText(" Active", " सक्रिय", " सक्रिय")}
                </Badge>
              </div>
              <CardDescription>
                {getLocalizedText(
                  "Real-time emergency assistance requests from pilgrims",
                  "तीर्थयात्रियों से रियल-टाइम आपातकालीन सहायता अनुरोध",
                  "यात्रेकरूंकडून रियल-टाइम आपत्कालीन मदत विनंत्या"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <Input 
                  type="text" 
                  placeholder={getLocalizedText("Search alerts...", "अलर्ट खोजें...", "अलर्ट शोधा...")} 
                  className="max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getLocalizedText("Alert ID", "अलर्ट आईडी", "अलर्ट आयडी")}</TableHead>
                    <TableHead>{getLocalizedText("Person", "व्यक्ति", "व्यक्ती")}</TableHead>
                    <TableHead>{getLocalizedText("Type", "प्रकार", "प्रकार")}</TableHead>
                    <TableHead>{getLocalizedText("Time", "समय", "वेळ")}</TableHead>
                    <TableHead>{getLocalizedText("Status", "स्थिति", "स्थिती")}</TableHead>
                    <TableHead>{getLocalizedText("Action", "कार्रवाई", "कृती")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow 
                      key={alert.id} 
                      className={`${alert.status === 'Active' ? 'bg-red-50' : ''} ${selectedAlert === alert.id ? 'bg-blue-50' : ''} cursor-pointer`}
                      onClick={() => setSelectedAlert(alert.id)}
                    >
                      <TableCell className="font-medium">{alert.alert_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-xs text-gray-500">{alert.phone_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(alert.type)}>
                          {getTypeLabel(alert.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatTime(alert.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${getStatusColor(alert.status)}`}>
                          {alert.status === 'Active' 
                            ? getLocalizedText("Active", "सक्रिय", "सक्रिय") 
                            : getLocalizedText("Resolved", "हल किया", "निराकरण केले")
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === 'Active' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsResolved(alert.id);
                                }}
                              >
                                {getLocalizedText("Resolve", "हल करें", "निराकरण करा")}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${alert.phone_number}`;
                                }}
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {getLocalizedText(
                    "No emergency alerts found",
                    "कोई आपातकालीन अलर्ट नहीं मिला",
                    "कोणतेही आपत्कालीन अलर्ट सापडले नाही"
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:w-1/3">
            {selectedAlertData ? (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={getBadgeColor(selectedAlertData.type)}>
                        {getTypeLabel(selectedAlertData.type)}
                      </Badge>
                      <CardTitle className="mt-2">
                        {selectedAlertData.alert_id}
                      </CardTitle>
                    </div>
                    <Badge className={`text-white ${getStatusColor(selectedAlertData.status)}`}>
                      {selectedAlertData.status === 'Active' 
                        ? getLocalizedText("Active", "सक्रिय", "सक्रिय") 
                        : getLocalizedText("Resolved", "हल किया", "निराकरण केले")
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {getLocalizedText("Person in Need", "सहायता चाहने वाला", "मदतीची गरज असणारी व्यक्ती")}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-medium">{selectedAlertData.name}</h3>
                      <p className="text-sm flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1 text-gray-500" />
                        {selectedAlertData.phone_number}
                      </p>
                    </div>
                  </div>
                  
                  {(selectedAlertData.latitude && selectedAlertData.longitude) && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {getLocalizedText("Location", "स्थान", "स्थान")}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="font-medium">{selectedAlertData.location_name || 'Location Available'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedAlertData.latitude?.toFixed(6)}, {selectedAlertData.longitude?.toFixed(6)}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                          onClick={() => openGoogleMaps(selectedAlertData.latitude!, selectedAlertData.longitude!)}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          {getLocalizedText("View on Map", "मानचित्र पर देखें", "नकाशावर पहा")}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedAlertData.message && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {getLocalizedText("Emergency Message", "आपातकालीन संदेश", "आपत्कालीन संदेश")}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{selectedAlertData.message}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {getLocalizedText("Timeline", "समयरेखा", "टाइमलाइन")}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{formatTime(selectedAlertData.created_at)}</p>
                          <p className="text-sm">
                            {getLocalizedText("Emergency alert created", "आपातकालीन अलर्ट बनाया गया", "आपत्कालीन अलर्ट तयार केले")}
                          </p>
                        </div>
                      </div>
                      
                      {selectedAlertData.status === 'Resolved' && (
                        <div className="flex gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Recently</p>
                            <p className="text-sm">
                              {getLocalizedText("Alert resolved", "अलर्ट हल किया गया", "अलर्ट निराकरण केले")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {selectedAlertData.status === 'Active' ? (
                    <>
                      <Button 
                        className="flex-1"
                        onClick={() => markAsResolved(selectedAlertData.id)}
                      >
                        {getLocalizedText("Mark Resolved", "हल के रूप में चिह्नित करें", "निराकरण म्हणून चिन्हांकित करा")}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = `tel:${selectedAlertData.phone_number}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const message = encodeURIComponent(getLocalizedText(
                            `Hello ${selectedAlertData.name}, this is emergency response regarding your alert ${selectedAlertData.alert_id}. We are here to help.`,
                            `नमस्ते ${selectedAlertData.name}, यह आपके अलर्ट ${selectedAlertData.alert_id} के संबंध में आपातकालीन प्रतिक्रिया है। हम आपकी सहायता के लिए यहाँ हैं।`,
                            `नमस्कार ${selectedAlertData.name}, तुमच्या अलर्ट ${selectedAlertData.alert_id} संदर्भात ही आपत्कालीन प्रतिसाद आहे. आम्ही तुमच्या मदतीसाठी येथे आहोत.`
                          ));
                          window.open(`sms:${selectedAlertData.phone_number}?body=${message}`, '_blank');
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      {getLocalizedText("Alert Resolved", "अलर्ट हल किया गया", "अलर्ट निराकरण केले")}
                    </Button>
                  )}
                </CardFooter>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">
                  {getLocalizedText(
                    "No alert selected",
                    "कोई अलर्ट चयनित नहीं",
                    "कोणतीही अलर्ट निवडली नाही"
                  )}
                </h3>
                <p className="text-sm text-gray-400 mt-2">
                  {getLocalizedText(
                    "Select an alert from the list to view details",
                    "विवरण देखने के लिए सूची से एक अलर्ट चुनें",
                    "तपशील पाहण्यासाठी यादीतून एक अलर्ट निवडा"
                  )}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmergencyAlerts;
