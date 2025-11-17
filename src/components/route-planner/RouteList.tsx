
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapIcon, Users, Navigation } from 'lucide-react';
import { Route } from '@/types';

interface RouteListProps {
  routes: Route[];
  startPoint: string;
  endPoint: string;
  onStartNavigation: (route: Route) => void;
  getLocalizedText: (eng: string, hindi: string, marathi: string) => string;
}

const RouteList = ({ routes, startPoint, endPoint, onStartNavigation, getLocalizedText }: RouteListProps) => {
  const getCrowdLevelText = (level: string) => {
    switch(level) {
      case 'low':
        return getLocalizedText("Low", "कम", "कमी");
      case 'moderate':
        return getLocalizedText("Moderate", "मध्यम", "मध्यम");
      case 'high':
        return getLocalizedText("High", "अधिक", "जास्त");
      default:
        return level;
    }
  };

  const getCrowdLevelClass = (level: string) => {
    switch(level) {
      case 'low':
        return "bg-green-100 text-green-700";
      case 'moderate':
        return "bg-yellow-100 text-yellow-700";
      case 'high':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {getLocalizedText(
            "Available Routes",
            "उपलब्ध मार्ग",
            "उपलब्ध मार्ग"
          )}
        </CardTitle>
        <CardDescription>
          {getLocalizedText(
            `From ${startPoint} to ${endPoint}`,
            `${startPoint} से ${endPoint} तक`,
            `${startPoint} पासून ${endPoint} पर्यंत`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id} className="overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{route.startPoint} → {route.endPoint}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapIcon className="h-4 w-4 mr-1" />
                      <span>{route.distance} km</span>
                      <span className="mx-2">•</span>
                      <span>{route.estimatedTime} min</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCrowdLevelClass(route.crowdLevel)}`}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {getCrowdLevelText(route.crowdLevel)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{getLocalizedText("Via", "के माध्यम से", "मार्गे")}</div>
                  <div className="text-sm text-gray-500">{route.waypoints.join(' → ')}</div>
                </div>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-pilgrim-orange hover:bg-orange-600"
                  onClick={() => onStartNavigation(route)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  {getLocalizedText("Start", "शुरू करें", "सुरू करा")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteList;
