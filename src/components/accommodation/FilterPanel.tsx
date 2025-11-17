
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FilterState {
  location: string;
  priceRange: [number, number];
  ratings: number[];
  roomTypes: string[];
  amenities: string[];
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const { language } = useLanguage();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const locations = [
    { value: 'nearby', label: getLocalizedText('Nearby', 'पास में', 'जवळपास') },
    { value: 'panchvati', label: getLocalizedText('Panchvati', 'पंचवटी', 'पंचवटी') },
    { value: 'trimbakeshwar', label: getLocalizedText('Trimbakeshwar', 'त्र्यंबकेश्वर', 'त्र्यंबकेश्वर') },
    { value: 'nashik-road', label: getLocalizedText('Nashik Road', 'नासिक रोड', 'नाशिक रोड') },
    { value: 'city-center', label: getLocalizedText('City Center', 'शहर केंद्र', 'शहर केंद्र') }
  ];

  const roomTypes = [
    { value: 'single', label: getLocalizedText('Single', 'सिंगल', 'सिंगल') },
    { value: 'double', label: getLocalizedText('Double', 'डबल', 'डबल') },
    { value: 'dormitory', label: getLocalizedText('Dormitory', 'डॉर्मिटरी', 'डॉर्मिटरी') },
    { value: 'family-suite', label: getLocalizedText('Family Suite', 'फैमिली सूट', 'फैमिली सूट') }
  ];

  const amenities = [
    { value: 'wifi', label: getLocalizedText('Wi-Fi', 'वाई-फाई', 'वाई-फाई') },
    { value: 'parking', label: getLocalizedText('Parking', 'पार्किंग', 'पार्किंग') },
    { value: 'meals', label: getLocalizedText('Meals', 'भोजन', 'जेवण') },
    { value: 'ac', label: getLocalizedText('A/C', 'ए/सी', 'ए/सी') },
    { value: 'hot-water', label: getLocalizedText('Hot Water', 'गर्म पानी', 'गरम पाणी') },
    { value: 'helpdesk', label: getLocalizedText('24x7 Helpdesk', '24x7 हेल्पडेस्क', '24x7 हेल्पडेस्क') }
  ];

  const sortOptions = [
    { value: 'relevance', label: getLocalizedText('Relevance', 'प्रासंगिकता', 'प्रासंगिकता') },
    { value: 'price-low', label: getLocalizedText('Price: Low to High', 'कीमत: कम से ज्यादा', 'किंमत: कमी ते जास्त') },
    { value: 'price-high', label: getLocalizedText('Price: High to Low', 'कीमत: ज्यादा से कम', 'किंमत: जास्त ते कमी') },
    { value: 'rating', label: getLocalizedText('Rating', 'रेटिंग', 'रेटिंग') },
    { value: 'distance', label: getLocalizedText('Distance', 'दूरी', 'अंतर') }
  ];

  const handleLocationChange = (value: string) => {
    onFiltersChange({ ...filters, location: value });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const newRatings = checked 
      ? [...filters.ratings, rating]
      : filters.ratings.filter(r => r !== rating);
    onFiltersChange({ ...filters, ratings: newRatings });
  };

  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    const newRoomTypes = checked 
      ? [...filters.roomTypes, roomType]
      : filters.roomTypes.filter(r => r !== roomType);
    onFiltersChange({ ...filters, roomTypes: newRoomTypes });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked 
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location && filters.location !== 'nearby') count++;
    if (filters.priceRange[0] > 500 || filters.priceRange[1] < 5000) count++;
    if (filters.ratings.length > 0) count++;
    if (filters.roomTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-pilgrim-brown">
            {getLocalizedText('Filters', 'फिल्टर', 'फिल्टर')}
          </CardTitle>
          {getActiveFiltersCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-pilgrim-orange">
              <X className="h-4 w-4 mr-1" />
              {getLocalizedText('Clear', 'साफ़ करें', 'साफ करा')}
            </Button>
          )}
        </div>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="w-fit">
            {getActiveFiltersCount()} {getLocalizedText('active', 'सक्रिय', 'सक्रिय')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Location', 'स्थान', 'स्थान')}
          </h4>
          <Select value={filters.location} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder={getLocalizedText('Select location', 'स्थान चुनें', 'स्थान निवडा')} />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Price Range', 'कीमत सीमा', 'किंमत श्रेणी')} (₹{filters.priceRange[0]} - ₹{filters.priceRange[1]})
          </h4>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={5000}
            min={500}
            step={100}
            className="w-full"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Star Rating', 'स्टार रेटिंग', 'स्टार रेटिंग')}
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
                />
                <label htmlFor={`rating-${rating}`} className="text-sm flex items-center gap-1">
                  {rating} {getLocalizedText('Star', 'स्टार', 'स्टार')} & {getLocalizedText('above', 'ऊपर', 'वर')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type Filter */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Room Type', 'कमरे का प्रकार', 'खोली प्रकार')}
          </h4>
          <div className="space-y-2">
            {roomTypes.map(roomType => (
              <div key={roomType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${roomType.value}`}
                  checked={filters.roomTypes.includes(roomType.value)}
                  onCheckedChange={(checked) => handleRoomTypeChange(roomType.value, checked as boolean)}
                />
                <label htmlFor={`room-${roomType.value}`} className="text-sm">
                  {roomType.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Amenities', 'सुविधाएं', 'सुविधा')}
          </h4>
          <div className="space-y-2">
            {amenities.map(amenity => (
              <div key={amenity.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.value}`}
                  checked={filters.amenities.includes(amenity.value)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked as boolean)}
                />
                <label htmlFor={`amenity-${amenity.value}`} className="text-sm">
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h4 className="font-medium mb-3 text-pilgrim-brown">
            {getLocalizedText('Sort By', 'इसके अनुसार क्रमबद्ध करें', 'यानुसार क्रमवारी लावा')}
          </h4>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
