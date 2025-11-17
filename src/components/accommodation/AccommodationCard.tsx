
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Snowflake, Phone, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AccommodationCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  pricePerNight: number;
  distance: number;
  tags: string[];
  amenities: string[];
  onBookNow: (accommodation: any) => void;
  onSaveForLater: (id: string) => void;
  isSaved: boolean;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  id,
  name,
  image,
  rating,
  pricePerNight,
  distance,
  tags,
  amenities,
  onBookNow,
  onSaveForLater,
  isSaved
}) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'parking': return <Car className="h-4 w-4" />;
      case 'meals': return <UtensilsCrossed className="h-4 w-4" />;
      case 'ac': return <Snowflake className="h-4 w-4" />;
      case 'helpdesk': return <Phone className="h-4 w-4" />;
      default: return null;
    }
  };

  const accommodation = {
    id, name, image, rating, pricePerNight, distance, tags, amenities
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-pilgrim-orange group">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 ${isSaved ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
          onClick={() => onSaveForLater(id)}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        <div className="absolute bottom-2 left-2 flex gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-white/90 text-pilgrim-brown">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-pilgrim-brown group-hover:text-pilgrim-orange transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{distance} {getLocalizedText('km away', 'किमी दूर', 'किमी दूर')}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {amenities.slice(0, 4).map((amenity, index) => (
            <div key={index} className="flex items-center gap-1 text-gray-500">
              {getAmenityIcon(amenity)}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-pilgrim-orange">₹{pricePerNight}</span>
            <span className="text-sm text-gray-600 ml-1">
              /{getLocalizedText('night', 'रात', 'रात्र')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-pilgrim-orange hover:bg-pilgrim-orangeDark text-white"
          onClick={() => onBookNow(accommodation)}
        >
          {getLocalizedText('Book Now', 'अभी बुक करें', 'आता बुक करा')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccommodationCard;
