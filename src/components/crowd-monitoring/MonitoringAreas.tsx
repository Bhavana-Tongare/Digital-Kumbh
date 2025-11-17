
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, AlertTriangle, Camera } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DetectionResult } from '@/utils/tensorflowDetection';
import { toast } from '@/hooks/use-toast';
import LiveCameraDialog from './LiveCameraDialog';
import { useNavigate } from 'react-router-dom';

interface MonitoringAreasProps {
  currentDetection: DetectionResult | null;
}

const MonitoringAreas: React.FC<MonitoringAreasProps> = ({ currentDetection }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCamera, setSelectedCamera] = useState<{
    id: string;
    name: string;
    viewUrl: string;
  } | null>(null);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const getCrowdLevelBorder = (count: number) => {
    if (count <= 2) return 'border-green-200';
    if (count <= 4) return 'border-yellow-200';
    return 'border-red-200';
  };

  const getCrowdLevelColor = (count: number) => {
    if (count <= 2) return 'bg-green-100 text-green-800';
    if (count <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCrowdStatus = (count: number) => {
    if (count <= 2) return 'Green';
    if (count <= 4) return 'Yellow';
    return 'Red';
  };

  const getStatusText = (count: number) => {
    if (count <= 2) return getLocalizedText('Safe', 'सुरक्षित', 'सुरक्षित');
    if (count <= 4) return getLocalizedText('Moderate', 'मध्यम', 'मध्यम');
    return getLocalizedText('High Crowd', 'उच्च भीड़', 'उच्च गर्दी');
  };

  // Helper function to encode CCTV credentials for RTSP URLs
  const buildRtspUrl = (username: string, password: string, ip: string, port: number, streamPath: string) => {
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    return `rtsp://${encodedUsername}:${encodedPassword}@${ip}:${port}/${streamPath}`;
  };

  // CCTV Camera Configuration
  // Updated with your actual CCTV credentials
  const cctvConfig = {
    temple: {
      username: 'admin',
      password: 'Admin@123',
      ip: '192.168.159.152',
      port: 554,
      streamPath: 'Streaming/Channels/101' // Hikvision format
    },
    ghat: {
      username: 'admin',
      password: 'Kkw@cctv',
      ip: '172.16.6.210',
      port: 554,
      streamPath: 'Streaming/Channels/101' // Hikvision format
    },
    foodCourt: {
      username: 'admin',
      password: 'Admin@123',
      ip: '192.168.159.152',
      port: 554,
      streamPath: 'Streaming/Channels/101' // Hikvision format
    }
  };

  // Define camera locations with local video files for demo areas
  const cameraLocations = [
    {
      id: 'temple',
      name: getLocalizedText('Temple', 'मंदिर', 'मंदिर'),
      viewUrl: buildRtspUrl(
        cctvConfig.temple.username,
        cctvConfig.temple.password,
        cctvConfig.temple.ip,
        cctvConfig.temple.port,
        cctvConfig.temple.streamPath
      ),
      cctvConfig: cctvConfig.temple,
      pushUrl: '' // Not used for CCTV
    },
    {
      id: 'ghat',
      name: getLocalizedText('Ghat', 'घाट', 'घाट'),
      viewUrl: buildRtspUrl(
        cctvConfig.ghat.username,
        cctvConfig.ghat.password,
        cctvConfig.ghat.ip,
        cctvConfig.ghat.port,
        cctvConfig.ghat.streamPath
      ),
      cctvConfig: cctvConfig.ghat,
      pushUrl: '' // Not used for CCTV
    },
    {
      id: 'food-court',
      name: getLocalizedText('Food Court', 'खाद्य क्षेत्र', 'अन्न परिसर'),
      viewUrl: '/videos/v4.mp4', // Real video file
      cctvConfig: undefined, // No CCTV config for demo videos
      pushUrl: ''
    }
  ];

  // Only use real detection count when camera is active, otherwise show 0
  const realTimeCount = currentDetection?.count || 0;

  // Create monitoring areas with video-based demo cameras
  const monitoringAreas = [
    { 
      id: 'area-1', 
      name: getLocalizedText('Temple', 'मंदिर', 'मंदिर'), 
      count: realTimeCount, // Only real AI detection
      status: getCrowdStatus(realTimeCount),
      cameraId: 'temple',
      isLive: currentDetection !== null // Only live when camera is actually running
    },
    { 
      id: 'area-2', 
      name: getLocalizedText('Food Court', 'खाद्य क्षेत्र', 'अन्न परिसर'), 
      count: 0, // Demo video - no real detection
      status: 'Green',
      cameraId: 'food-court',
      isLive: false // Demo video is not "live"
    },
    { 
      id: 'area-3', 
      name: getLocalizedText('Ghat', 'घाट', 'घाट'), 
      count: 0, // No camera active = 0 count
      status: 'Green',
      cameraId: 'ghat',
      isLive: false
    }
  ];

  const handleViewCamera = (area: any) => {
    const cameraLocation = cameraLocations.find(cam => cam.id === area.cameraId);
    if (cameraLocation) {
      setSelectedCamera(cameraLocation);
    }
  };

  return (
    <>
   <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white via-orange-50/70 to-orange-100/40 backdrop-blur-md">
  <CardHeader className="text-center pb-4">
    <CardTitle className="text-3xl font-semibold text-orange-600">
      {getLocalizedText("Monitoring Areas", "निगरानी क्षेत्र", "निरीक्षण क्षेत्रे")}
    </CardTitle>
    <CardDescription className="text-gray-600">
      {getLocalizedText(
        "Real-time AI-powered crowd detection from active camera feeds only",
        "केवल सक्रिय कैमरा फीड से रियल-टाइम AI-संचालित भीड़ का पता लगाना",
        "केवळ सक्रिय कॅमेरा फीडवरून रिअल-टाइम AI-चालित गर्दी शोध"
      )}
    </CardDescription>
  </CardHeader>

  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {monitoringAreas.map((area) => (
      <div
        key={area.id}
        className={`relative bg-white/90 border ${getCrowdLevelBorder(
          area.count
        )} rounded-2xl p-5 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
        style={{
          backgroundImage: 'url("/images/card-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-800">{area.name}</h3>
          <Badge className={`${getCrowdLevelColor(area.count)} px-3 py-1 rounded-full`}>
            {getStatusText(area.count)}
          </Badge>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-semibold">{area.count}</span>
          <span>{getLocalizedText("people", "लोग", "लोक")}</span>

          {area.isLive ? (
            <div className="flex items-center ml-auto text-green-600 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              {getLocalizedText("LIVE", "लाइव", "लाइव्ह")}
            </div>
          ) : (
            <div className="flex items-center ml-auto text-gray-400 text-xs">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
              {getLocalizedText("OFFLINE", "ऑफ़लाइन", "ऑफलाइन")}
            </div>
          )}
        </div>

        {area.count >= 5 && area.isLive && (
          <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {getLocalizedText(
              "High crowd - Send volunteers!",
              "उच्च भीड़ - स्वयंसेवक भेजें!",
              "उच्च गर्दी - स्वयंसेवक पाठवा!"
            )}
          </div>
        )}

        <div className="mt-4">
          {area.cameraId ? (
            <Button
              size="sm"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-4 shadow-sm transition-all"
              onClick={() => handleViewCamera(area)}
            >
              <Camera className="h-4 w-4 mr-2" />
              {getLocalizedText("View Live Camera", "लाइव कैमरा देखें", "लाइव्ह कॅमेरा पहा")}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="w-full" disabled>
              {getLocalizedText("Camera Not Available", "कैमरा उपलब्ध नहीं", "कॅमेरा उपलब्ध नाही")}
            </Button>
          )}
        </div>
      </div>
    ))}
  </CardContent>

  <CardFooter className="flex justify-center py-6">
    <Button
      variant="outline"
      className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all"
      onClick={() => navigate('/crowd-analytics')}
    >
      <BarChart3 className="h-5 w-5 mr-2" />
      {getLocalizedText("View Analytics", "विश्लेषण देखें", "विश्लेषण पहा")}
    </Button>
  </CardFooter>
</Card>

      {selectedCamera && (
        <LiveCameraDialog
          isOpen={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          location={selectedCamera}
        />
      )}
    </>
  );
};

export default MonitoringAreas;
