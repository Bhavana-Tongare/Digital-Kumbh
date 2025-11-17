import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Coffee, Home, Phone, ExternalLink, Check, AlertCircle, Loader2, Navigation, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RouteMap from '@/components/route-planner/RouteMap';
import ApiKeyInput from '@/components/nearby/ApiKeyInput';
import { PlacesService, PlaceDetails } from '@/services/placesService';
import { Route } from '@/types';

const NearbyPlaces: React.FC = () => {
  const { translate, language } = useLanguage();
  const { toast } = useToast();
  const [places, setPlaces] = useState<PlaceDetails[]>([]);
  const [allPlaces, setAllPlaces] = useState<PlaceDetails[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showDirectionsMap, setShowDirectionsMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesService] = useState(new PlacesService());

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "Nearby Places",
    "आस-पास के स्थान",
    "जवळपासची ठिकाणे"
  );

  // Request location permission and get user location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    setLocationPermissionDenied(false);
    
    if (!navigator.geolocation) {
      toast({
        title: getLocalizedText("Location Not Supported", "स्थान समर्थित नहीं", "स्थान समर्थित नाही"),
        description: getLocalizedText(
          "Your browser doesn't support location services",
          "आपका ब्राउज़र स्थान सेवाओं का समर्थन नहीं करता",
          "तुमचा ब्राउझर स्थान सेवांना समर्थन देत नाही"
        ),
        variant: "destructive",
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', { latitude, longitude });
        
        // Store user location in correct format [longitude, latitude]
        const locationCoords: [number, number] = [longitude, latitude];
        setUserLocation(locationCoords);
        
        // Fetch nearby places based on user location
        await fetchNearbyPlaces(latitude, longitude);
        
        setIsLoadingLocation(false);
        
        toast({
          title: getLocalizedText("Location Found", "स्थान मिल गया", "स्थान सापडले"),
          description: getLocalizedText(
            "Loading nearby places based on your location",
            "आपके स्थान के आधार पर आस-पास के स्थान लोड कर रहे हैं",
            "तुमच्या स्थानाच्या आधारावर जवळपासची ठिकाणे लोड करत आहे"
          ),
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationPermissionDenied(true);
        setIsLoadingLocation(false);
        
        let errorMessage = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = getLocalizedText(
              "Location access denied. Please enable location permission and refresh the page.",
              "स्थान पहुंच अस्वीकृत। कृपया स्थान अनुमति सक्षम करें और पृष्ठ को रीफ्रेश करें।",
              "स्थान प्रवेश नाकारला. कृपया स्थान परवानगी सक्षम करा आणि पृष्ठ रीफ्रेश करा."
            );
            break;
          default:
            errorMessage = getLocalizedText(
              "Unable to get your location. Please try again.",
              "आपका स्थान प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।",
              "तुमचे स्थान मिळवू शकत नाही. कृपया पुन्हा प्रयत्न करा."
            );
        }
        
        toast({
          title: getLocalizedText("Location Error", "स्थान त्रुटि", "स्थान त्रुटी"),
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // Fetch nearby places based on location
  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    setIsLoadingPlaces(true);
    try {
      const nearbyPlaces = await placesService.getNearbyPlaces(latitude, longitude, 15000);
      
      setAllPlaces(nearbyPlaces);
      setPlaces(nearbyPlaces);
      
      toast({
        title: getLocalizedText("Places Loaded", "स्थान लोड हो गए", "ठिकाणे लोड झाली"),
        description: getLocalizedText(
          `Found ${nearbyPlaces.length} nearby places based on your location`,
          `आपके स्थान के आधार पर ${nearbyPlaces.length} आस-पास के स्थान मिले`,
          `तुमच्या स्थानाच्या आधारावर ${nearbyPlaces.length} जवळपासची ठिकाणे सापडली`
        ),
      });
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      toast({
        title: getLocalizedText("Error Loading Places", "स्थान लोड करने में त्रुटि", "ठिकाणे लोड करताना त्रुटी"),
        description: getLocalizedText(
          "Failed to load nearby places. Please check your internet connection.",
          "आस-पास के स्थान लोड करने में विफल। कृपया अपना इंटरनेट कनेक्शन जांचें।",
          "जवळपासची ठिकाणे लोड करण्यात अयशस्वी. कृपया तुमचे इंटरनेट कनेक्शन तपासा."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const filterPlaces = (type: string) => {
    setFilter(type);
    if (type === 'all') {
      setPlaces(allPlaces);
    } else {
      setPlaces(allPlaces.filter(place => place.type === type));
    }
    
    toast({
      title: getLocalizedText(
        `Showing ${type === 'all' ? 'all' : type} places`,
        `${type === 'all' ? 'सभी' : type} स्थान दिखा रहे हैं`,
        `${type === 'all' ? 'सर्व' : type} ठिकाणे दाखवत आहे`
      ),
      duration: 2000,
    });
  };

  const getPlaceTypeIcon = (type: string) => {
    switch(type) {
      case 'restaurant':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case 'hotel':
        return <Home className="h-5 w-5 text-blue-500" />;
      case 'temple':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'hospital':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'police':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'service':
        return <Navigation className="h-5 w-5 text-blue-500" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlaceTypeText = (type: string) => {
    switch(type) {
      case 'restaurant':
        return getLocalizedText("Restaurant", "रेस्टोरेंट", "रेस्टॉरंट");
      case 'hotel':
        return getLocalizedText("Hotel", "होटल", "हॉटेल");
      case 'temple':
        return getLocalizedText("Temple", "मंदिर", "मंदिर");
      case 'hospital':
        return getLocalizedText("Hospital", "अस्पताल", "रुग्णालय");
      case 'police':
        return getLocalizedText("Police Station", "पुलिस स्टेशन", "पोलीस स्टेशन");
      case 'service':
        return getLocalizedText("Service", "सेवा", "सेवा");
      default:
        return type;
    }
  };

  const handleShowDirections = (place: PlaceDetails) => {
    console.log('Starting directions from user location:', userLocation, 'to place:', place.name, place.coordinates);
    setSelectedPlace(place);
    setShowDirectionsMap(true);
  };

  const handleViewOnMap = (place: PlaceDetails) => {
    const mapUrl = placesService.getMapUrl(place, userLocation);
    console.log('Opening map URL:', mapUrl);
    window.open(mapUrl, '_blank');
  };

  // Loading state
  if (isLoadingLocation || isLoadingPlaces) {
    return (
      <DashboardLayout title={pageTitle}>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-pilgrim-orange" />
              <h3 className="text-lg font-medium">
                {isLoadingLocation ? getLocalizedText(
                  "Getting your location...",
                  "आपका स्थान प्राप्त कर रहे हैं...",
                  "तुमचे स्थान मिळवत आहे..."
                ) : getLocalizedText(
                  "Loading nearby places...",
                  "आस-पास के स्थान लोड कर रहे हैं...",
                  "जवळपासची ठिकाणे लोड करत आहे..."
                )}
              </h3>
              <p className="text-gray-500 text-center">
                {isLoadingLocation ? getLocalizedText(
                  "Please allow location access to show nearby places",
                  "आस-पास के स्थान दिखाने के लिए कृपया स्थान पहुंच की अनुमति दें",
                  "जवळपासची ठिकाणे दाखवण्यासाठी कृपया स्थान परवानगी द्या"
                ) : getLocalizedText(
                  "Finding places near your location...",
                  "आपके स्थान के पास स्थान खोज रहे हैं...",
                  "तुमच्या स्थानाजवळची ठिकाणे शोधत आहे..."
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Location permission denied state
  if (locationPermissionDenied) {
    return (
      <DashboardLayout title={pageTitle}>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-medium">
                {getLocalizedText(
                  "Location Permission Required",
                  "स्थान अनुमति आवश्यक",
                  "स्थान परवानगी आवश्यक"
                )}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {getLocalizedText(
                  "We need access to your location to show realistic nearby places based on your current area.",
                  "आपके वर्तमान क्षेत्र के आधार पर वास्तविक आस-पास के स्थान दिखाने के लिए हमें आपके स्थान तक पहुंच की आवश्यकता है।",
                  "तुमच्या सध्याच्या क्षेत्राच्या आधारावर वास्तविक जवळपासची ठिकाणे दाखवण्यासाठी आम्हाला तुमच्या स्थानाचा प्रवेश हवा आहे."
                )}
              </p>
              <Button 
                onClick={requestLocationPermission}
                className="bg-pilgrim-orange hover:bg-orange-600"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {getLocalizedText("Try Again", "पुनः प्रयास करें", "पुन्हा प्रयत्न करा")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    if (showDirectionsMap && selectedPlace && userLocation) {
      console.log('Rendering RouteMap with:', {
        userLocation,
        selectedPlace: selectedPlace.name,
        placeCoordinates: selectedPlace.coordinates
      });

      const tempRoute: Route = {
        id: "temp-route",
        startPoint: "Your Current Location",
        endPoint: selectedPlace.name,
        distance: selectedPlace.distance,
        estimatedTime: Math.ceil(selectedPlace.distance * 12), // More realistic walking time
        crowdLevel: "low",
        waypoints: [
          getLocalizedText(
            `Navigate to ${selectedPlace.name}`,
            `${selectedPlace.name} की ओर जाएं`,
            `${selectedPlace.name} कडे जा`
          )
        ],
        isBlocked: false
      };
      
      return (
        <RouteMap
          selectedRoute={tempRoute}
          onBack={() => setShowDirectionsMap(false)}
          getLocalizedText={getLocalizedText}
          startLocation="Your Current Location"
          endLocation={selectedPlace.name}
          startCoordinates={userLocation}
          endCoordinates={selectedPlace.coordinates}
          destination={selectedPlace.name}
        />
      );
    }
    
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {getLocalizedText(
              "Nearby places based on your current location with realistic names and details",
              "आपके वर्तमान स्थान के आधार पर वास्तविक नाम और विवरण के साथ आस-पास के स्थान",
              "तुमच्या सध्याच्या स्थानाच्या आधारावर वास्तविक नावे आणि तपशीलांसह जवळपासची ठिकाणे"
            )}
          </CardDescription>
          {userLocation && (
            <div className="flex items-center text-sm text-green-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {getLocalizedText(
                  `Live location detected: ${userLocation[1].toFixed(4)}, ${userLocation[0].toFixed(4)}`,
                  `लाइव स्थान का पता लगाया गया: ${userLocation[1].toFixed(4)}, ${userLocation[0].toFixed(4)}`,
                  `लाइव्ह स्थान आढळले: ${userLocation[1].toFixed(4)}, ${userLocation[0].toFixed(4)}`
                )}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={filter === 'all' ? "default" : "outline"} 
              onClick={() => filterPlaces('all')}
              className={filter === 'all' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("All", "सभी", "सर्व")} ({allPlaces.length})
            </Button>
            <Button 
              variant={filter === 'hotel' ? "default" : "outline"} 
              onClick={() => filterPlaces('hotel')}
              className={filter === 'hotel' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("Hotels", "होटल", "हॉटेल")} ({allPlaces.filter(p => p.type === 'hotel').length})
            </Button>
            <Button 
              variant={filter === 'restaurant' ? "default" : "outline"} 
              onClick={() => filterPlaces('restaurant')}
              className={filter === 'restaurant' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("Restaurants", "रेस्टोरेंट", "रेस्टॉरंट")} ({allPlaces.filter(p => p.type === 'restaurant').length})
            </Button>
            <Button 
              variant={filter === 'temple' ? "default" : "outline"} 
              onClick={() => filterPlaces('temple')}
              className={filter === 'temple' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("Temples", "मंदिर", "मंदिरे")} ({allPlaces.filter(p => p.type === 'temple').length})
            </Button>
            <Button 
              variant={filter === 'hospital' ? "default" : "outline"} 
              onClick={() => filterPlaces('hospital')}
              className={filter === 'hospital' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("Hospitals", "अस्पताल", "रुग्णालय")} ({allPlaces.filter(p => p.type === 'hospital').length})
            </Button>
            <Button 
              variant={filter === 'service' ? "default" : "outline"} 
              onClick={() => filterPlaces('service')}
              className={filter === 'service' ? "bg-pilgrim-orange" : ""}
            >
              {getLocalizedText("Services", "सेवाएं", "सेवा")} ({allPlaces.filter(p => p.type === 'service').length})
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <Card key={place.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={place.photo || "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={place.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-medium flex items-center shadow-sm">
                    {getPlaceTypeIcon(place.type)}
                    <span className="ml-1">{getPlaceTypeText(place.type)}</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-pilgrim-orange text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                    {place.distance}km away
                  </div>
                  {place.isOpen !== undefined && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className={place.isOpen ? "bg-green-500" : "bg-red-500"}>
                        {place.isOpen ? 
                          getLocalizedText("Open", "खुला", "उघडे") : 
                          getLocalizedText("Closed", "बंद", "बंद")}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-bold text-white text-lg">{place.name}</h3>
                  </div>
                </div>
                <CardContent className="flex-grow pt-4">
                  <div className="flex items-center text-sm mb-2">
                    <MapPin className="h-4 w-4 text-pilgrim-orange mr-1" />
                    <span className="text-gray-600">{place.address || place.location}</span>
                  </div>
                  {place.rating && (
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                      <span className="font-medium">{place.rating.toFixed(1)}/5</span>
                      <span className="text-gray-500 ml-1">rating</span>
                    </div>
                  )}
                  {place.contact && (
                    <div className="flex items-center text-sm mb-2">
                      <Phone className="h-4 w-4 text-pilgrim-orange mr-1" />
                      <a href={`tel:${place.contact}`} className="text-blue-600 hover:underline">
                        {place.contact}
                      </a>
                    </div>
                  )}
                  {place.website && (
                    <div className="flex items-center text-sm">
                      <ExternalLink className="h-4 w-4 text-pilgrim-orange mr-1" />
                      <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {getLocalizedText("Visit Website", "वेबसाइट देखें", "वेबसाइट पहा")}
                      </a>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-pilgrim-orange text-pilgrim-orange hover:bg-pilgrim-orange hover:text-white"
                    onClick={() => handleShowDirections(place)}
                    disabled={!userLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {getLocalizedText("Directions", "दिशा-निर्देश", "मार्गदर्शन")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                    onClick={() => handleViewOnMap(place)}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {places.length === 0 && !isLoadingPlaces && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {getLocalizedText(
                  "No places found in this category near your location.",
                  "आपके स्थान के पास इस श्रेणी में कोई स्थान नहीं मिला।",
                  "तुमच्या स्थानाजवळ या श्रेणीमध्ये कोणतेही ठिकाण सापडले नाही."
                )}
              </p>
              <p className="text-gray-400 text-sm">
                {getLocalizedText(
                  "Try selecting a different category or check your internet connection.",
                  "अलग श्रेणी का चयन करने या अपने इंटरनेट कनेक्शन की जांच करने का प्रयास करें।",
                  "वेगळी श्रेणी निवडण्याचा किंवा तुमचे इंटरनेट कनेक्शन तपासण्याचा प्रयत्न करा."
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title={pageTitle}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default NearbyPlaces;
