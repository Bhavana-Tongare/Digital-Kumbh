
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Users, Navigation, ExternalLink } from 'lucide-react';
import { Route } from '@/types';

interface RouteMapProps {
  selectedRoute: Route;
  onBack: () => void;
  getLocalizedText: (eng: string, hindi: string, marathi: string) => string;
  startLocation?: string;
  endLocation?: string;
  startCoordinates?: [number, number];
  endCoordinates?: [number, number];
  destination?: string;
}

const RouteMap = ({ 
  selectedRoute, 
  onBack, 
  getLocalizedText,
  startLocation,
  endLocation,
  startCoordinates,
  endCoordinates,
  destination
}: RouteMapProps) => {

  const openGoogleMaps = () => {
    let googleMapsUrl = '';
    
    console.log('Opening Google Maps with coordinates:', {
      startCoordinates,
      endCoordinates,
      startLocation,
      endLocation,
      destination
    });
    
    // If we have coordinates, use them for more accurate navigation
    if (startCoordinates && endCoordinates) {
      const originCoords = `${startCoordinates[1]},${startCoordinates[0]}`;
      const destCoords = `${endCoordinates[1]},${endCoordinates[0]}`;
      googleMapsUrl = `https://www.google.com/maps/dir/${originCoords}/${destCoords}/?travelmode=walking`;
    } else {
      // Fallback to location names
      const origin = encodeURIComponent(startLocation || selectedRoute.startPoint);
      const dest = encodeURIComponent(endLocation || destination || selectedRoute.endPoint);
      googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${dest}/?travelmode=walking`;
    }
    
    console.log('Opening Google Maps with URL:', googleMapsUrl);
    window.open(googleMapsUrl, '_blank');
  };

  const openGoogleMapsApp = () => {
    let mapsAppUrl = '';
    
    console.log('Opening Maps App with coordinates:', {
      startCoordinates,
      endCoordinates
    });
    
    // If we have coordinates, use them for mobile app
    if (startCoordinates && endCoordinates) {
      const originCoords = `${startCoordinates[1]},${startCoordinates[0]}`;
      const destCoords = `${endCoordinates[1]},${endCoordinates[0]}`;
      mapsAppUrl = `google.maps://maps?saddr=${originCoords}&daddr=${destCoords}&directionsmode=walking`;
    } else {
      // Fallback to location names
      const origin = encodeURIComponent(startLocation || selectedRoute.startPoint);
      const dest = encodeURIComponent(endLocation || destination || selectedRoute.endPoint);
      mapsAppUrl = `google.maps://maps?saddr=${origin}&daddr=${dest}&directionsmode=walking`;
    }
    
    console.log('Opening Maps App with URL:', mapsAppUrl);
    
    // Try to open the app, fallback to web version
    const link = document.createElement('a');
    link.href = mapsAppUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      openGoogleMaps();
    }, 2000);
  };

  return (
    <Card className="max-w-6xl mx-auto mb-6">
      <CardContent className="p-0">
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4 z-10 bg-white shadow-md"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {getLocalizedText("Back", "वापस जाएं", "परत जा")}
          </Button>
          
          {/* Route Info Display */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {getLocalizedText("Live Directions", "लाइव दिशा निर्देश", "लाइव्ह दिशा निर्देश")}
              </h2>
              <p className="text-gray-600">
                {getLocalizedText(
                  `From Your Current Location to ${endLocation || destination || selectedRoute.endPoint}`,
                  `आपके वर्तमान स्थान से ${endLocation || destination || selectedRoute.endPoint} तक`,
                  `तुमच्या सध्याच्या स्थानापासून ${endLocation || destination || selectedRoute.endPoint} पर्यंत`
                )}
              </p>
              {startCoordinates && endCoordinates && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800 font-medium mb-2">
                    {getLocalizedText("✅ Live Location Detected", "✅ लाइव स्थान का पता लगाया गया", "✅ लाइव्ह स्थान आढळले")}
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>
                      {getLocalizedText("Your Location:", "आपका स्थान:", "तुमचे स्थान:")} 
                      <span className="font-mono ml-1">{startCoordinates[1].toFixed(6)}, {startCoordinates[0].toFixed(6)}</span>
                    </div>
                    <div>
                      {getLocalizedText("Destination:", "गंतव्य:", "गंतव्य:")} 
                      <span className="font-mono ml-1">{endCoordinates[1].toFixed(6)}, {endCoordinates[0].toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{selectedRoute.estimatedTime}</div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("Minutes", "मिनट", "मिनिटे")}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{selectedRoute.distance}</div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("Kilometers", "किलोमीटर", "किलोमीटर")}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 capitalize">{selectedRoute.crowdLevel}</div>
                <div className="text-sm text-gray-600">
                  {getLocalizedText("Crowd Level", "भीड़ का स्तर", "गर्दीचे प्रमाण")}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={openGoogleMaps}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg"
                size="lg"
              >
                <Navigation className="h-5 w-5 mr-2" />
                {getLocalizedText(
                  "Get Live Directions in Google Maps",
                  "Google Maps में लाइव दिशा निर्देश प्राप्त करें",
                  "Google Maps मध्ये लाइव्ह दिशा निर्देश मिळवा"
                )}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>

              <Button 
                onClick={openGoogleMapsApp}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-4 text-lg"
                size="lg"
              >
                <Navigation className="h-5 w-5 mr-2" />
                {getLocalizedText(
                  "Open in Google Maps App",
                  "Google Maps ऐप में खोलें",
                  "Google Maps अॅप मध्ये उघडा"
                )}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-pilgrim-orange" />
                {getLocalizedText("Route Details", "मार्ग विवरण", "मार्ग तपशील")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">
                    {getLocalizedText("From:", "से:", "पासून:")}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {getLocalizedText("Your Current Location", "आपका वर्तमान स्थान", "तुमचे सध्याचे स्थान")}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    {getLocalizedText("To:", "तक:", "पर्यंत:")}
                  </span>
                  <span className="ml-2 text-gray-600">{endLocation || destination || selectedRoute.endPoint}</span>
                </div>
                <div>
                  <span className="font-medium">
                    {getLocalizedText("Distance:", "दूरी:", "अंतर:")}
                  </span>
                  <span className="ml-2 text-gray-600">{selectedRoute.distance} km</span>
                </div>
                <div>
                  <span className="font-medium">
                    {getLocalizedText("Est. Time:", "अनुमानित समय:", "अंदाजित वेळ:")}
                  </span>
                  <span className="ml-2 text-gray-600">{selectedRoute.estimatedTime} min</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {getLocalizedText(
                  "🗺️ The directions will use your current live location as the starting point for the most accurate navigation to your destination.",
                  "🗺️ दिशा निर्देश आपके गंतव्य के लिए सबसे सटीक नेविगेशन के लिए प्रारंभिक बिंदु के रूप में आपके वर्तमान लाइव स्थान का उपयोग करेंगे।",
                  "🗺️ दिशा निर्देश तुमच्या गंतव्यासाठी सर्वात अचूक नेविगेशनसाठी प्रारंभ बिंदू म्हणून तुमच्या सध्याच्या लाइव्ह स्थानाचा वापर करतील."
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteMap;
