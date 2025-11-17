
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Bell, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DetectionResult } from '@/utils/cameraDetection';
import { useLanguage } from '@/context/LanguageContext';

interface StatusPanelProps {
  currentDetection: DetectionResult | null;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ currentDetection }) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  return (
    <Card className="md:w-1/3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getLocalizedText("Current Status", "वर्तमान स्थिति", "वर्तमान स्थिती")}</span>
          <Badge variant="outline">{getLocalizedText("Live", "लाइव", "लाईव्ह")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${
            currentDetection ? 
              (currentDetection.status === 'Green' ? 'bg-green-50 border-green-100' : 
               'bg-red-50 border-red-100') : 
              'bg-green-50 border-green-100'
          }`}>
            <div className="flex items-center">
              <div className="mr-4">
                {currentDetection && currentDetection.status === 'Red' ? (
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                ) : (
                  <Users className={`h-10 w-10 ${
                    currentDetection && currentDetection.status === 'Red' ? 
                      'text-red-600' : 'text-green-600'
                  }`} />
                )}
              </div>
              <div>
                <h4 className={`font-medium ${
                  currentDetection && currentDetection.status === 'Red' ? 
                    'text-red-800' : 'text-green-800'
                }`}>
                  {getLocalizedText("Overall Status", "समग्र स्थिति", "एकूण स्थिती")}
                </h4>
                <div className="flex items-center mt-1">
                  <div className={`h-3 w-3 rounded-full ${
                    currentDetection && currentDetection.status === 'Red' ? 
                      'bg-red-500' : 'bg-green-500'
                  } mr-2`}></div>
                  <span className={`text-sm ${
                    currentDetection && currentDetection.status === 'Red' ? 
                      'text-red-700' : 'text-green-700'
                  }`}>
                    {currentDetection && currentDetection.status === 'Red' ? 
                      getLocalizedText("MAXIMUM CAPACITY REACHED", "अधिकतम क्षमता पहुंची", "कमाल क्षमता पोहोचली") : 
                      getLocalizedText("Normal", "सामान्य", "सामान्य")
                    }
                  </span>
                </div>
                <div className="text-lg font-bold mt-2">
                  {currentDetection ? 
                    `${currentDetection.count} ${getLocalizedText("people detected", "लोग पहचाने गए", "लोक ओळखले")}` : 
                    "0 " + getLocalizedText("people detected", "लोग पहचाने गए", "लोक ओळखले")
                  }
                </div>
              </div>
            </div>
            
            {currentDetection && currentDetection.status === 'Red' && (
              <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-md text-red-800 text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {getLocalizedText(
                  "STOP ENTRY IMMEDIATELY!", 
                  "प्रवेश तुरंत बंद करें!", 
                  "प्रवेश त्वरित थांबवा!"
                )}
              </div>
            )}
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">
              {getLocalizedText("Alert Thresholds", "अलर्ट थ्रेशोल्ड", "अलर्ट थ्रेशोल्ड")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">
                  {getLocalizedText("Green (Safe)", "हरा (सुरक्षित)", "हिरवा (सुरक्षित)")}
                </span>
                <span>0-3 {getLocalizedText("people", "लोग", "लोक")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">
                  {getLocalizedText("Red (Maximum Capacity)", "लाल (अधिकतम क्षमता)", "लाल (कमाल क्षमता)")}
                </span>
                <span>4+ {getLocalizedText("people", "लोग", "लोक")}</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">
                {getLocalizedText("Alert Settings", "अलर्ट सेटिंग्स", "अलर्ट सेटिंग्स")}
              </h4>
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <label htmlFor="notify-red">
                  {getLocalizedText("Notify for maximum capacity", "अधिकतम क्षमता के लिए सूचित करें", "कमाल क्षमतेसाठी सूचित करा")}
                </label>
                <Switch id="notify-red" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="auto-alert">
                  {getLocalizedText("Auto-trigger alerts to authorities", "अधिकारियों को स्वचालित अलर्ट", "अधिकाऱ्यांना स्वयंचलित सूचना")}
                </label>
                <Switch id="auto-alert" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="display-screen">
                  {getLocalizedText("Display alerts on digital screens", "डिजिटल स्क्रीन पर अलर्ट दिखाएं", "डिजिटल स्क्रीनवर अलर्ट दाखवा")}
                </label>
                <Switch id="display-screen" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPanel;
