
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExternalLink, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  getLocalizedText: (eng: string, hindi: string, marathi: string) => string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit, getLocalizedText }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('google_places_api_key', apiKey.trim());
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2 text-pilgrim-orange" />
          {getLocalizedText(
            "Google Places API Key Required",
            "Google Places API Key आवश्यक",
            "Google Places API Key आवश्यक"
          )}
        </CardTitle>
        <CardDescription>
          {getLocalizedText(
            "To show real nearby places based on your location, please enter your Google Places API key",
            "आपके स्थान के आधार पर वास्तविक आस-पास के स्थान दिखाने के लिए, कृपया अपनी Google Places API key दर्ज करें",
            "तुमच्या स्थानाच्या आधारावर खरी जवळपासची ठिकाणे दाखवण्यासाठी, कृपया तुमची Google Places API key टाका"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            {getLocalizedText(
              "How to get your API key:",
              "अपनी API key कैसे प्राप्त करें:",
              "तुमची API key कशी मिळवावी:"
            )}
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>
              {getLocalizedText(
                "Go to Google Cloud Console",
                "Google Cloud Console पर जाएं",
                "Google Cloud Console वर जा"
              )}
            </li>
            <li>
              {getLocalizedText(
                "Enable the Places API",
                "Places API सक्षम करें",
                "Places API सक्षम करा"
              )}
            </li>
            <li>
              {getLocalizedText(
                "Create credentials and get your API key",
                "क्रेडेंशियल बनाएं और अपनी API key प्राप्त करें",
                "क्रेडेन्शियल तयार करा आणि तुमची API key मिळवा"
              )}
            </li>
          </ol>
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            {getLocalizedText("Get API Key", "API Key प्राप्त करें", "API Key मिळवा")}
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apikey">
              {getLocalizedText("Google Places API Key", "Google Places API Key", "Google Places API Key")}
            </Label>
            <Input
              id="apikey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={getLocalizedText(
                "Enter your Google Places API key",
                "अपनी Google Places API key दर्ज करें",
                "तुमची Google Places API key टाका"
              )}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-pilgrim-orange hover:bg-orange-600">
            {getLocalizedText("Load Real Places", "वास्तविक स्थान लोड करें", "खरी ठिकाणे लोड करा")}
          </Button>
        </form>

        <p className="text-xs text-gray-500">
          {getLocalizedText(
            "Your API key is stored locally in your browser and is not shared with anyone",
            "आपकी API key आपके ब्राउज़र में स्थानीय रूप से संग्रहीत है और किसी के साथ साझा नहीं की जाती",
            "तुमची API key तुमच्या ब्राउझरमध्ये स्थानिक पातळीवर संचयित आहे आणि कोणाशीही सामायिक केली जात नाही"
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
