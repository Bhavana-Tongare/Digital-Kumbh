import React, { useRef, useState, useRef as useRefAlias } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { startCameraWithAI, stopCameraAI, DetectionResult } from '@/utils/tensorflowDetection';
import { toast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { logCrowdSample } from '@/services/crowdAnalyticsService';

interface CameraFeedProps {
  isMonitoring: boolean;
  setIsMonitoring: React.Dispatch<React.SetStateAction<boolean>>;
  currentDetection: DetectionResult | null;
  setCurrentDetection: React.Dispatch<React.SetStateAction<DetectionResult | null>>;
  setCameraStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  isMonitoring, 
  setIsMonitoring, 
  currentDetection, 
  setCurrentDetection,
  setCameraStream
}) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastLogRef = useRefAlias<number>(0);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleConnectCamera = async () => {
    if (isMonitoring) {
      // Stop monitoring
      stopCameraAI(videoRef.current);
      setCameraStream(null);
      setIsMonitoring(false);
      toast({
        title: getLocalizedText("AI Monitoring Stopped", "AI निगरानी बंद", "AI निरीक्षण थांबले"),
        description: getLocalizedText(
          "Camera and AI detection stopped",
          "कैमरा और AI डिटेक्शन बंद",
          "कॅमेरा आणि AI डिटेक्शन थांबले"
        ),
      });
    } else {
      // Start monitoring with AI
      toast({
        title: getLocalizedText("Loading AI Model", "AI मॉडल लोड हो रहा है", "AI मॉडेल लोड होत आहे"),
        description: getLocalizedText(
          "Please wait while we initialize TensorFlow.js...",
          "TensorFlow.js इनिशियलाइज़ होने तक प्रतीक्षा करें...",
          "TensorFlow.js initialize होत असताना कृपया प्रतीक्षा करा..."
        ),
      });

      const stream = await startCameraWithAI(videoRef.current, async (result) => {
        setCurrentDetection(result);
        // Throttle persistence to once per 20s
        const now = Date.now();
        if (now - lastLogRef.current > 20000) {
          lastLogRef.current = now;
          try {
            await logCrowdSample({
              place_id: 'temple',
              place_name: getLocalizedText('Temple', 'मंदिर', 'मंदिर'),
              count: result.count,
              status: result.status as any,
            });
          } catch (e) {
            // ignore logging errors to keep UI smooth
            console.warn('Failed to log crowd sample', e);
          }
        }
      });
      
      if (stream) {
        setCameraStream(stream);
        setIsMonitoring(true);
        toast({
          title: getLocalizedText("AI Monitoring Started", "AI निगरानी शुरू", "AI निरीक्षण सुरू"),
          description: getLocalizedText(
            "Real-time AI people detection is now active",
            "रीयल-टाइम AI लोग डिटेक्शन अब सक्रिय है",
            "रिअल-टाइम AI लोक डिटेक्शन आता सक्रिय आहे"
          ),
        });
      }
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !isMonitoring) {
      toast({
        description: getLocalizedText(
          "Camera is not active. Start monitoring first.",
          "कैमरा सक्रिय नहीं है। पहले निगरानी शुरू करें।",
          "कॅमेरा सक्रिय नाही. प्रथम निरीक्षण सुरू करा."
        ),
        variant: "destructive",
      });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const screenshot = canvas.toDataURL('image/png');
      
      // Download screenshot
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `crowd-${new Date().toISOString()}.png`;
      link.click();
      
      toast({
        description: getLocalizedText(
          "Screenshot captured and downloaded",
          "स्क्रीनशॉट कैप्चर किया गया और डाउनलोड किया गया",
          "स्क्रीनशॉट कॅप्चर केले आणि डाउनलोड केले"
        ),
      });
    }
  };

  const getCrowdLevelColor = (status: string) => {
    switch (status) {
      case 'Green': return 'bg-green-100 text-green-800';
      case 'Yellow': return 'bg-yellow-100 text-yellow-800';
      case 'Red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="md:w-2/3">
      <CardHeader>
        <CardTitle>
          {getLocalizedText("AI-Powered Live Monitoring", "AI-पावर्ड लाइव निगरानी", "AI-चालित लाईव्ह निरीक्षण")}
        </CardTitle>
        <CardDescription>
          {getLocalizedText(
            "Real-time crowd monitoring using TensorFlow.js and computer vision",
            "TensorFlow.js और कंप्यूटर विज़न का उपयोग करके रीयल-टाइम भीड़ की निगरानी",
            "TensorFlow.js आणि कॉम्प्यूटर व्हिजन वापरून रिअल-टाइम गर्दी निरीक्षण"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 p-2 rounded-lg aspect-video flex items-center justify-center overflow-hidden relative">
          <video 
            ref={videoRef}
            className={`w-full h-full object-cover ${isMonitoring ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          ></video>
          
          {!isMonitoring && (
            <div className="text-center p-8 absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">
                {getLocalizedText(
                  "Connect camera for AI detection",
                  "AI डिटेक्शन के लिए कैमरा कनेक्ट करें",
                  "AI डिटेक्शनसाठी कॅमेरा कनेक्ट करा"
                )}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {getLocalizedText(
                  "TensorFlow.js will analyze the feed in real-time",
                  "TensorFlow.js रीयल-टाइम में फीड का विश्लेषण करेगा",
                  "TensorFlow.js रिअल-टाइममध्ये फीडचे विश्लेषण करेल"
                )}
              </p>
            </div>
          )}
          
          {isMonitoring && currentDetection && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{currentDetection.count}</span>
              <Badge className={`${getCrowdLevelColor(currentDetection.status)} text-xs`}>
                {currentDetection.status}
              </Badge>
              <span className="text-xs">AI</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <label className="text-sm font-medium">
              {getLocalizedText("Select Camera Source", "कैमरा स्रोत चुनें", "कॅमेरा स्त्रोत निवडा")}
            </label>
            <Select defaultValue="webcam">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={getLocalizedText("Select camera", "कैमरा चुनें", "कॅमेरा निवडा")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webcam">Webcam</SelectItem>
                <SelectItem value="mobile">{getLocalizedText("Mobile Camera", "मोबाइल कैमरा", "मोबाईल कॅमेरा")}</SelectItem>
                <SelectItem value="cctv">CCTV 1</SelectItem>
                <SelectItem value="cctv2">CCTV 2</SelectItem>
                <SelectItem value="external">{getLocalizedText("External Camera", "बाहरी कैमरा", "बाह्य कॅमेरा")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:w-1/2">
            <label className="text-sm font-medium">
              {getLocalizedText("AI Detection Model", "AI डिटेक्शन मॉडल", "AI डिटेक्शन मॉडेल")}
            </label>
            <Select defaultValue="tensorflow">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={getLocalizedText("Select model", "मॉडल चुनें", "मॉडेल निवडा")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tensorflow">TensorFlow.js COCO-SSD</SelectItem>
                <SelectItem value="yolo">YOLOv5 (Coming Soon)</SelectItem>
                <SelectItem value="custom">{getLocalizedText("Custom Model", "कस्टम मॉडल", "कस्टम मॉडेल")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={takeScreenshot}
          disabled={!isMonitoring}
        >
          {getLocalizedText("Take Screenshot", "स्क्रीनशॉट लें", "स्क्रीनशॉट घ्या")}
        </Button>
        <Button
          onClick={handleConnectCamera}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              {getLocalizedText("Stop AI Detection", "AI डिटेक्शन बंद करें", "AI डिटेक्शन थांबवा")}
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              {getLocalizedText("Start AI Detection", "AI डिटेक्शन शुरू करें", "AI डिटेक्शन सुरू करा")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CameraFeed;
