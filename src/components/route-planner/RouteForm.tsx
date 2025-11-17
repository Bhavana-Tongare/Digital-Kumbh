import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route, MapPin, Flag, Loader2 } from "lucide-react";

interface RouteFormProps {
  startPoint: string;
  setStartPoint: (value: string) => void;
  endPoint: string;
  setEndPoint: (value: string) => void;
  maxCrowdLevel: number;
  setMaxCrowdLevel: (value: number) => void;
  loading: boolean;
  onFindRoute: () => void;
}

const RouteForm = ({
  startPoint,
  setStartPoint,
  endPoint,
  setEndPoint,
  loading,
  onFindRoute,
}: RouteFormProps) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === "english") return eng;
    if (language === "hindi") return hindi;
    return marathi;
  };

  return (
    <div className="relative max-w-6xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-lg border border-orange-100">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-500"
        style={{
          backgroundImage: "url('src/assets/ramkund.png')", // <-- add your image here
        }}
      ></div>

      {/* Overlay gradient to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-orange-50/90"></div>

      {/* Card Content */}
      <Card className="relative flex flex-col md:flex-row items-center bg-transparent shadow-none border-0">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-pilgrim-orange text-center md:text-left">
              {getLocalizedText("Route Planner", "मार्ग योजनाकार", "मार्ग नियोजक")}
            </CardTitle>
            <CardDescription className="text-gray-700 text-center md:text-left">
              {getLocalizedText(
                "Plan your route with real-time crowd insights",
                "वास्तविक समय की भीड़ की जानकारी के साथ अपना मार्ग तय करें",
                "रीअल-टाइम गर्दीच्या माहितीसह तुमचा मार्ग नियोजित करा"
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              <div>
                <Label
                  htmlFor="startPoint"
                  className="flex items-center text-gray-800 font-medium"
                >
                  <MapPin className="w-4 h-4 mr-2 text-pilgrim-orange" />
                  {getLocalizedText(
                    "Starting Point",
                    "प्रारंभिक बिंदु",
                    "प्रारंभ बिंदू"
                  )}
                </Label>
                <Input
                  id="startPoint"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder={getLocalizedText(
                    "e.g. Main Entrance",
                    "जैसे मुख्य प्रवेश द्वार",
                    "उदा. मुख्य प्रवेशद्वार"
                  )}
                  className="mt-1 border-orange-200 focus:border-pilgrim-orange focus:ring-pilgrim-orange bg-white/90"
                />
              </div>

              <div>
                <Label
                  htmlFor="endPoint"
                  className="flex items-center text-gray-800 font-medium"
                >
                  <Flag className="w-4 h-4 mr-2 text-pilgrim-orange" />
                  {getLocalizedText("Destination", "गंतव्य", "गंतव्य")}
                </Label>
                <Input
                  id="endPoint"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  placeholder={getLocalizedText(
                    "e.g. Ganesh Temple",
                    "जैसे गणेश मंदिर",
                    "उदा. गणेश मंदिर"
                  )}
                  className="mt-1 border-orange-200 focus:border-pilgrim-orange focus:ring-pilgrim-orange bg-white/90"
                />
              </div>

              <Button
                className="w-full bg-pilgrim-orange hover:bg-orange-600 text-white rounded-xl py-5 text-lg transition-all duration-200"
                onClick={onFindRoute}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Route className="h-5 w-5 mr-2" />
                )}
                {loading
                  ? getLocalizedText(
                      "Finding Routes...",
                      "मार्ग खोज रहे हैं...",
                      "मार्ग शोधत आहे..."
                    )
                  : getLocalizedText("Find Routes", "मार्ग खोजें", "मार्ग शोधा")}
              </Button>
            </div>
          </CardContent>
        </div>

        {/* Right Side - Empty (you can add icons or live map later) */}
        <div className="hidden md:flex w-1/2 justify-center items-center p-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-orange-100 p-6 text-center">
            <p className="text-gray-700 font-medium">
              {getLocalizedText(
                "Visualize your path here soon!",
                "जल्द ही यहाँ अपना मार्ग देखें!",
                "लवकरच येथे तुमचा मार्ग पाहा!"
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RouteForm;
