
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, XCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { LostPersonReport } from '@/types';

interface ReportScreenDisplayProps {
  reports: LostPersonReport[];
  onClose: () => void;
  language: 'english' | 'hindi' | 'marathi';
}

const ReportScreenDisplay: React.FC<ReportScreenDisplayProps> = ({ 
  reports, 
  onClose,
  language 
}) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!screenRef.current) return;
    
    if (!document.fullscreenElement) {
      screenRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const formatDate = (date: string | Date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return new Intl.DateTimeFormat(language === 'english' ? 'en-US' : language === 'hindi' ? 'hi-IN' : 'mr-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div ref={screenRef} className="w-full max-w-5xl max-h-[90vh] overflow-auto">
        <Card className="w-full">
          <CardHeader className="bg-red-600 text-white rounded-t-lg flex flex-row items-center justify-between">
            <div className="flex items-center">
              <Monitor className="w-6 h-6 mr-2" />
              <CardTitle className="text-xl md:text-2xl">
                {getLocalizedText(
                  "LOST PERSON ALERT",
                  "खोए व्यक्ति की चेतावनी",
                  "हरवलेल्या व्यक्तीची सूचना"
                )}
              </CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-gray-300"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                  </svg>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-gray-300"
                onClick={onClose}
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-red-600 mb-2 animate-pulse">
                {getLocalizedText(
                  "URGENT: MISSING PERSON",
                  "अत्यावश्यक: लापता व्यक्ति",
                  "तातडीचे: हरवलेली व्यक्ती"
                )}
              </h2>
              <p className="text-lg text-gray-700">
                {getLocalizedText(
                  "If you have seen any of these individuals, please contact the nearest authority immediately",
                  "यदि आपने इनमें से किसी भी व्यक्ति को देखा है, तो कृपया तुरंत निकटतम अधिकारी से संपर्क करें",
                  "जर तुम्ही या व्यक्तींपैकी कोणालाही पाहिले असेल तर, कृपया त्वरित जवळच्या अधिकाऱ्याशी संपर्क साधा"
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map(report => (
                <div key={report.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-500 animate-pulse">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-2">
                      {report.photo ? (
                        <img 
                          src={report.photo} 
                          alt={report.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-1/2 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-red-600">{report.name}</h3>
                          <div className="mt-1 space-y-1">
                            <p className="flex items-center text-gray-700">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span className="font-medium">{report.age} {getLocalizedText("years old", "वर्ष का", "वर्षे वय")}</span>
                            </p>
                            {report.gender && (
                              <p className="text-gray-700">
                                <span className="font-medium">{getLocalizedText(
                                  report.gender === 'male' ? 'Male' : report.gender === 'female' ? 'Female' : 'Other',
                                  report.gender === 'male' ? 'पुरुष' : report.gender === 'female' ? 'महिला' : 'अन्य',
                                  report.gender === 'male' ? 'पुरुष' : report.gender === 'female' ? 'स्त्री' : 'इतर'
                                )}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                          {getLocalizedText("MISSING", "लापता", "हरवलेले")}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <p className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-1 text-red-500" />
                          <strong>{getLocalizedText("Last seen:", "आखिरी बार देखा गया:", "शेवटचे पाहिले:")}</strong> 
                          <span className="ml-1">{report.lastSeenLocation}</span>
                        </p>
                        <p className="flex items-center text-gray-700">
                          <Clock className="w-4 h-4 mr-1 text-red-500" />
                          <strong>{getLocalizedText("When:", "कब:", "कधी:")}</strong> 
                          <span className="ml-1">{formatDate(report.lastSeenTime)}</span>
                        </p>
                        <p className="text-gray-700">
                          <strong>{getLocalizedText("Wearing:", "पहनावा:", "परिधान:")}</strong> 
                          <span className="ml-1">{report.clothing}</span>
                        </p>
                      </div>
                      
                      {report.notes && (
                        <p className="mt-2 text-gray-700 bg-yellow-50 p-2 rounded">
                          <strong>{getLocalizedText("Additional info:", "अतिरिक्त जानकारी:", "अतिरिक्त माहिती:")}</strong> {report.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 text-center">
                    <p className="font-bold text-red-600">
                      {getLocalizedText(
                        "If seen, please contact security immediately: 1800-XXX-XXXX",
                        "अगर देखा, तो तुरंत सुरक्षा से संपर्क करें: 1800-XXX-XXXX",
                        "दिसल्यास, कृपया लगेच सुरक्षा कर्मचाऱ्यांशी संपर्क साधा: 1800-XXX-XXXX"
                      )}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {getLocalizedText("Report ID:", "रिपोर्ट आईडी:", "अहवाल आयडी:")} {report.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-red-600 text-white flex justify-between p-4">
            <p className="text-sm">
              {getLocalizedText(
                "EMERGENCY CONTACT: 1800-XXX-XXXX",
                "आपातकालीन संपर्क: 1800-XXX-XXXX",
                "आपत्कालीन संपर्क: 1800-XXX-XXXX"
              )}
            </p>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-red-500"
              onClick={onClose}
            >
              {getLocalizedText("Close Alert", "अलर्ट बंद करें", "सूचना बंद करा")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ReportScreenDisplay;
