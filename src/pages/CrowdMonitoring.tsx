import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { DetectionResult } from '@/utils/tensorflowDetection';


import MonitoringAreas from '@/components/crowd-monitoring/MonitoringAreas';

const CrowdMonitoring: React.FC = () => {
  const { language } = useLanguage();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "AI Crowd Monitoring System",
    "AI भीड़ निगरानी प्रणाली",
    "AI गर्दी निरीक्षण प्रणाली"
  );


  return (
    <DashboardLayout title={pageTitle}>
      <div className="space-y-6">
        
        
        <MonitoringAreas currentDetection={currentDetection} />

      </div>
    </DashboardLayout>
  );
};

export default CrowdMonitoring;
