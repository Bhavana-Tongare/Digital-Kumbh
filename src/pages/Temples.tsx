import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Calendar, Clock, ExternalLink, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteMap from '@/components/route-planner/RouteMap';
import { Route } from '@/types';
import trimbakeshwarTemple from '@/assets/trimbakeshwar-temple.jpg';
import saptashrungiDeviTemple from '@/assets/saptashrungi-devi-temple.png';
import kalaramTemple from '@/assets/kalaram-temple.png';
import muktidhamTemple from '@/assets/muktidham-temple.png';
import sundarnarayanTemple from '@/assets/sundarnarayan-temple.png';

const nashikTemplesMockData = [
  {
    id: "temple1",
    name: "Trimbakeshwar Temple",
    location: "Trimbak, Nashik, Maharashtra",
    coordinates: [73.5299, 19.9330] as [number, number],
    history: `Trimbakeshwar Temple is one of the twelve Jyotirlingas of Lord Shiva. It is located in the town of Trimbak in the Nashik district of Maharashtra, India. The temple is considered one of the holiest places in Maharashtra and is situated about 28 km from Nashik city.

    The temple derives its name from three hills that surround it, representing the three gods - Brahma, Vishnu, and Mahesh (Shiva). The temple was built by Peshwa Balaji Bajirao in 1755-1786 AD. The architecture is beautiful with intricate carvings and is built in the traditional Hindu style.

    The sacred river Godavari originates from Brahmagiri hill near this temple, making it even more significant for Hindu devotees. The temple is famous for the Kumbh Mela that takes place here every 12 years.`,
    timings: "5:30 AM - 9:00 PM",
    bestTimeToVisit: "October to March",
    significance: "One of the twelve Jyotirlingas, origin of river Godavari",
    photo: trimbakeshwarTemple,
    rituals: [
      "Mahaarti (6:00 AM)",
      "Abhishek (7:00 AM - 12:00 PM)",
      "Sandhya Aarti (7:00 PM)",
      "Shej Aarti (9:00 PM)"
    ],
    nearbyAttractions: [
      "Brahmagiri Hill",
      "Godavari River Origin",
      "Anjaneri Hills (Birthplace of Hanuman)",
      "Gangadwar"
    ],
    type: "temple",
    distance: 28,
  },
  {
    id: "temple2",
    name: "Saptashrungi Devi Temple",
    location: "Vani, Nashik, Maharashtra",
    coordinates: [74.1167, 20.3833] as [number, number],
    history: `Saptashrungi Devi Temple is dedicated to Goddess Saptashrungi, an incarnation of Goddess Durga. The temple is located on a hill called Saptashrungi, meaning "seven peaks," about 60 km from Nashik city in Vani taluka.

    The temple is one of the 51 Shakti Peethas and is considered one of the most powerful temples in Maharashtra. According to legend, this is where the chest of Goddess Sati fell. The temple dates back several centuries and has been a major pilgrimage site.

    The goddess is believed to be self-manifested (Swayambhu) and the temple attracts thousands of devotees, especially during Navratri. The climb to the temple involves 4,500 steps, but there's also a motorable road available.`,
    timings: "5:00 AM - 10:00 PM",
    bestTimeToVisit: "October to March, Navratri period",
    significance: "One of the 51 Shakti Peethas, Swayambhu Devi temple",
    photo: saptashrungiDeviTemple,
    rituals: [
      "Kakad Aarti (5:00 AM)",
      "Abhishek (8:00 AM - 12:00 PM)",
      "Madhyan Aarti (12:00 PM)",
      "Sandhya Aarti (7:00 PM)",
      "Shej Aarti (9:30 PM)"
    ],
    nearbyAttractions: [
      "Saptashrungi Hills",
      "Vani Village",
      "Kalsubai Peak (nearby)",
      "Harishchandragad (trekking)"
    ],
    type: "temple",
    distance: 60,
  },
  {
    id: "temple3",
    name: "Kalaram Temple",
    location: "Panchavati, Nashik, Maharashtra",
    coordinates: [73.7898, 19.9975] as [number, number],
    history: `Kalaram Temple is a significant Hindu temple dedicated to Lord Rama in Panchavati, Nashik. The temple was built in 1790 by Sardar Rangrao Odhekar. The temple gets its name from the black stone idol of Lord Rama, hence "Kalaram" (Kala = black, Ram = Lord Rama).

    The temple has great historical and religious significance as it is located in Panchavati, where Lord Rama, Sita, and Lakshmana spent their exile period according to the Ramayana. The temple architecture is built in the Hemadpanthi style with beautiful stone carvings.

    The temple gained historical importance during India's freedom movement when Dr. B.R. Ambedkar launched the Kalaram Temple Satyagraha in 1930 for Dalit rights and temple entry. The temple is surrounded by other significant places from the Ramayana.`,
    timings: "5:00 AM - 11:00 PM",
    bestTimeToVisit: "All year round, especially during Ram Navami",
    significance: "Lord Rama's exile location, Ramayana significance",
    photo: kalaramTemple,
    rituals: [
      "Mangal Aarti (5:00 AM)",
      "Abhishek (6:00 AM - 12:00 PM)",
      "Madhyan Aarti (12:00 PM)",
      "Sandhya Aarti (7:00 PM)",
      "Shej Aarti (10:30 PM)"
    ],
    nearbyAttractions: [
      "Sita Gufa (Sita Cave)",
      "Lakshmana Temple",
      "Tapovan",
      "Ramkund (Godavari Ghat)"
    ],
    type: "temple",
    distance: 2,
  },
  {
    id: "temple4",
    name: "Muktidham Temple",
    location: "Nashik Road, Nashik, Maharashtra",
    coordinates: [73.8567, 20.0059] as [number, number],
    history: `Muktidham Temple is a beautiful marble temple complex located in Nashik. Built entirely of white marble, the temple complex was constructed to replicate the famous pilgrimage sites of India under one roof. The temple was built with the vision of providing darshan of all major Hindu deities in one place.

    The temple complex includes replicas of the twelve Jyotirlingas, important temples from various parts of India, and houses idols of numerous Hindu deities. The architecture is stunning with intricate marble work and beautiful gardens surrounding the complex.

    The temple is also known for its peaceful atmosphere and spiritual environment. It serves as a convenient pilgrimage destination for those who cannot visit the actual locations of famous temples across India.`,
    timings: "5:00 AM - 9:00 PM",
    bestTimeToVisit: "All year round",
    significance: "Replica of major pilgrimage sites, All-marble construction",
    photo: muktidhamTemple,
    rituals: [
      "Morning Aarti (6:00 AM)",
      "Abhishek (8:00 AM - 12:00 PM)",
      "Evening Aarti (7:00 PM)",
      "Shej Aarti (8:30 PM)"
    ],
    nearbyAttractions: [
      "Nashik Road Railway Station",
      "Coin Museum",
      "Someshwar Temple",
      "Pandavleni Caves"
    ],
    type: "temple",
    distance: 8,
  },
  {
    id: "temple5",
    name: "Sundarnarayan Temple",
    location: "Panchavati, Nashik, Maharashtra",
    coordinates: [73.7935, 19.9990] as [number, number],
    history: `Sundarnarayan Temple is an ancient temple dedicated to Lord Vishnu, located near the Ramkund in Panchavati, Nashik. The temple is believed to be over 1000 years old and holds great significance in Hindu mythology and the Ramayana.

    According to legends, this is the place where Lord Rama performed the last rites for his father, King Dasharatha. The temple is situated on the banks of the holy river Godavari, making it an important pilgrimage site.

    The temple architecture showcases ancient Indian temple design with beautiful stone carvings. The temple is particularly significant during the Kumbh Mela and attracts thousands of pilgrims who come to perform ancestral rites and take holy dips in the Godavari.`,
    timings: "5:00 AM - 10:00 PM",
    bestTimeToVisit: "All year round, especially during Kumbh Mela",
    significance: "Ancient Vishnu temple, Ramayana connection, Ancestral rites",
    photo: sundarnarayanTemple,
    rituals: [
      "Mangal Aarti (5:00 AM)",
      "Abhishek (6:00 AM - 11:00 AM)",
      "Madhyan Aarti (12:00 PM)",
      "Sandhya Aarti (7:00 PM)",
      "Shej Aarti (9:30 PM)"
    ],
    nearbyAttractions: [
      "Ramkund",
      "Kalaram Temple",
      "Sita Gufa",
      "Godavari River Ghats"
    ],
    type: "temple",
    distance: 1.5,
  }
  
];

const Temples: React.FC = () => {
  const { translate, language } = useLanguage();
  const { toast } = useToast();
  const [temples] = useState(nashikTemplesMockData);
  const [selectedTemple, setSelectedTemple] = useState<any>(null);
  const [showDirectionsMap, setShowDirectionsMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([73.7898, 19.9975]); // Default Nashik coordinates

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const pageTitle = getLocalizedText(
    "Nashik Temple Guide",
    "नाशिक मंदिर मार्गदर्शिका",
    "नाशिक मंदिर मार्गदर्शक"
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Keep using default location
        }
      );
    }
  }, []);

  const handleTempleClick = (temple: any) => {
    setSelectedTemple(temple);
  };

  const handleShowDirections = (temple: any) => {
    setSelectedTemple(temple);
    setShowDirectionsMap(true);
  };

  const renderContent = () => {
    if (showDirectionsMap && selectedTemple) {
      const tempRoute: Route = {
        id: "temp-route",
        startPoint: "Your Location",
        endPoint: selectedTemple.name,
        distance: selectedTemple.distance || 5,
        estimatedTime: (selectedTemple.distance || 5) * 5,
        crowdLevel: "low",
        waypoints: [
          getLocalizedText(
            `Head towards ${selectedTemple.name}`,
            `${selectedTemple.name} की ओर जाएं`,
            `${selectedTemple.name} कडे जा`
          )
        ],
        isBlocked: false
      };
      
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="max-w-4xl mx-auto mb-4 flex"
            onClick={() => setShowDirectionsMap(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getLocalizedText("Back to Temples", "मंदिरों पर वापस जाएं", "मंदिरांवर परत जा")}
          </Button>
          
          <RouteMap
            selectedRoute={tempRoute}
            onBack={() => setShowDirectionsMap(false)}
            getLocalizedText={getLocalizedText}
            startCoordinates={userLocation}
            endCoordinates={selectedTemple.coordinates}
            destination={selectedTemple.name}
          />
        </>
      );
    }
    
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {getLocalizedText(
              "Discover famous temples in Nashik with detailed information and directions",
              "विस्तृत जानकारी और दिशा-निर्देश के साथ नाशिक के प्रसिद्ध मंदिरों की खोज करें",
              "तपशीलवार माहिती आणि मार्गदर्शनासह नाशिकमधील प्रसिद्ध मंदिरे शोधा"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple) => (
              <Card key={temple.id} className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48">
                  <img 
                    src={temple.photo} 
                    alt={temple.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-bold text-white text-lg">{temple.name}</h3>
                  </div>
                </div>
                <CardContent className="flex-grow pt-4">
                  <div className="flex items-center text-sm mb-2">
                    <MapPin className="h-4 w-4 text-pilgrim-orange mr-1" />
                    <span>{temple.location}</span>
                  </div>
                  <div className="flex items-center text-sm mb-2">
                    <Clock className="h-4 w-4 text-pilgrim-orange mr-1" />
                    <span>{temple.timings}</span>
                  </div>
                  <div className="flex items-center text-sm mb-2">
                    <Calendar className="h-4 w-4 text-pilgrim-orange mr-1" />
                    <span>{getLocalizedText("Best time to visit", "घूमने का सबसे अच्छा समय", "भेट देण्याचा सर्वोत्तम काळ")}: {temple.bestTimeToVisit}</span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="mr-1 mb-1">
                      {getLocalizedText("Sacred", "पवित्र", "पवित्र")}
                    </Badge>
                    <Badge variant="secondary" className="mr-1 mb-1">
                      {getLocalizedText("Historical", "ऐतिहासिक", "ऐतिहासिक")}
                    </Badge>
                    <Badge variant="secondary" className="mr-1 mb-1">
                      {getLocalizedText("Nashik", "नाशिक", "नाशिक")}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-pilgrim-orange text-pilgrim-orange hover:bg-pilgrim-orange hover:text-white"
                    onClick={() => handleShowDirections(temple)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {getLocalizedText("Get Directions", "दिशा-निर्देश प्राप्त करें", "मार्गदर्शन मिळवा")}
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full border-pilgrim-orange text-pilgrim-orange hover:bg-pilgrim-orange hover:text-white"
                        onClick={() => handleTempleClick(temple)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {getLocalizedText("View Details", "विवरण देखें", "तपशील पहा")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{temple.name}</DialogTitle>
                        <DialogDescription>
                          {temple.location}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="h-72 overflow-hidden rounded-lg mb-4">
                          <img 
                            src={temple.photo} 
                            alt={temple.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        </div>
                        
                        <Tabs defaultValue="info">
                          <TabsList className="mb-4">
                            <TabsTrigger value="info">
                              {getLocalizedText("Information", "जानकारी", "माहिती")}
                            </TabsTrigger>
                            <TabsTrigger value="history">
                              {getLocalizedText("History", "इतिहास", "इतिहास")}
                            </TabsTrigger>
                            <TabsTrigger value="rituals">
                              {getLocalizedText("Rituals & Timings", "अनुष्ठान और समय", "विधी आणि वेळ")}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="info">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Significance", "महत्व", "महत्त्व")}</h4>
                                <p>{temple.significance}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Location Details", "स्थान विवरण", "स्थान तपशील")}</h4>
                                <p className="mb-2">{temple.coordinates.join(", ")}</p>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-pilgrim-orange text-pilgrim-orange hover:bg-pilgrim-orange hover:text-white"
                                    onClick={() => {
                                      setShowDirectionsMap(true);
                                      document.querySelector('[data-dismiss]')?.dispatchEvent(
                                        new MouseEvent('click', { bubbles: true })
                                      );
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    {getLocalizedText("Get Directions", "दिशा-निर्देश प्राप्त करें", "मार्गदर्शन मिळवा")}
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Nearby Attractions", "आस-पास के आकर्षण", "जवळपासची आकर्षणे")}</h4>
                                <ul className="list-disc pl-5">
                                  {temple.nearbyAttractions.map((attraction, index) => (
                                    <li key={index}>{attraction}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="history">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Historical Background", "ऐतिहासिक पृष्ठभूमि", "ऐतिहासिक पार्श्वभूमी")}</h4>
                              <div className="prose max-w-none">
                                <p className="whitespace-pre-line">{temple.history}</p>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="rituals">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Visit Timings", "यात्रा समय", "भेट देण्याची वेळ")}</h4>
                                <p className="mb-4">{temple.timings}</p>
                                <div className="flex items-center mb-2">
                                  <Calendar className="h-4 w-4 text-pilgrim-orange mr-1" />
                                  <span className="font-medium">{getLocalizedText("Best Time to Visit", "घूमने का सबसे अच्छा समय", "भेट देण्याचा सर्वोत्तम काळ")}:</span> {temple.bestTimeToVisit}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{getLocalizedText("Important Rituals & Ceremonies", "महत्वपूर्ण अनुष्ठान और समारोह", "महत्त्वाचे विधी आणि समारंभ")}</h4>
                                <ul className="list-disc pl-5">
                                  {temple.rituals.map((ritual, index) => (
                                    <li key={index} className="mb-1">{ritual}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
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

export default Temples;
