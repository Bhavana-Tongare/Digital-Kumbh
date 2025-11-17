import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Route as RouteType } from '@/types';
import RouteForm from '@/components/route-planner/RouteForm';
import RouteList from '@/components/route-planner/RouteList';
import RouteMap from '@/components/route-planner/RouteMap';
import { fetchRouteData, getUserLocation } from '@/components/route-planner/utils/routeService';

const RoutePlanner: React.FC = () => {
  const { translate, language } = useLanguage();
  const { toast } = useToast();
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [maxCrowdLevel, setMaxCrowdLevel] = useState(50);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([73.7898, 19.9975]); // Default location
  const [destinationLocation, setDestinationLocation] = useState<[number, number]>([73.8008, 20.0056]); // Default destination

  useEffect(() => {
    // Get user's location
    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        console.log("Got user location:", location);
        setUserLocation(location);
        // Set a random destination near the user's location
        setDestinationLocation([
          location[0] + (Math.random() * 0.02 - 0.01),
          location[1] + (Math.random() * 0.02 - 0.01)
        ]);
      } catch (error) {
        console.error("Error getting location:", error);
        // Keep using default location
      }
    };
    
    fetchLocation();
  }, []);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleFindRoute = async () => {
    if (!startPoint || !endPoint) {
      toast({
        title: getLocalizedText(
          "Please enter both start and end points",
          "कृपया प्रारंभ और अंत दोनों बिंदु दर्ज करें",
          "कृपया प्रारंभ आणि शेवट दोन्ही बिंदू प्रविष्ट करा"
        ),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setShowRoutes(false);
    setShowMap(false);
    
    try {
      const routeData = await fetchRouteData(startPoint, endPoint, maxCrowdLevel);
      setRoutes(routeData);
      setShowRoutes(true);
      
      // Set a random destination location for the selected end point
      setDestinationLocation([
        userLocation[0] + (Math.random() * 0.04 - 0.02),
        userLocation[1] + (Math.random() * 0.04 - 0.02)
      ]);
      
      toast({
        title: getLocalizedText("Routes found", "मार्ग मिल गए", "मार्ग सापडले"),
        description: getLocalizedText(
          `${routeData.length} routes from ${startPoint} to ${endPoint}`,
          `${startPoint} से ${endPoint} तक ${routeData.length} मार्ग`,
          `${startPoint} पासून ${endPoint} पर्यंत ${routeData.length} मार्ग`
        ),
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: getLocalizedText("Error finding routes", "मार्ग खोजने में त्रुटि", "मार्ग शोधण्यात त्रुटी"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNavigation = (route: RouteType) => {
    setSelectedRoute(route);
    setShowMap(true);
    
    toast({
      title: getLocalizedText("Navigation Started", "नेविगेशन शुरू हुआ", "नेविगेशन सुरू झाले"),
      description: getLocalizedText(
        `Following route from ${route.startPoint} to ${route.endPoint}`,
        `${route.startPoint} से ${route.endPoint} तक मार्ग का अनुसरण करना`,
        `${route.startPoint} पासून ${route.endPoint} पर्यंत मार्गाचे अनुसरण करत आहे`
      )
    });
  };

  return (
    <DashboardLayout title={getLocalizedText("Route Planner", "मार्ग योजनाकार", "मार्ग नियोजक")}>
      <RouteForm 
        startPoint={startPoint}
        setStartPoint={setStartPoint}
        endPoint={endPoint}
        setEndPoint={setEndPoint}
        maxCrowdLevel={maxCrowdLevel}
        setMaxCrowdLevel={setMaxCrowdLevel}
        loading={loading}
        onFindRoute={handleFindRoute}
      />

      {showMap && selectedRoute && (
        <RouteMap 
          selectedRoute={selectedRoute}
          onBack={() => setShowMap(false)}
          getLocalizedText={getLocalizedText}
          startLocation={startPoint}
          endLocation={endPoint}
        />
      )}

      {showRoutes && !showMap && (
        <RouteList 
          routes={routes}
          startPoint={startPoint}
          endPoint={endPoint}
          onStartNavigation={handleStartNavigation}
          getLocalizedText={getLocalizedText}
        />
      )}
    </DashboardLayout>
  );
};

export default RoutePlanner;
