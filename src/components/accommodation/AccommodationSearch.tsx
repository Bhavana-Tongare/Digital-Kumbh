
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapIcon, Grid, AlertTriangle } from 'lucide-react';
import AccommodationCard from './AccommodationCard';
import FilterPanel from './FilterPanel';
import BookingModal from './BookingModal';
import { useLanguage } from '@/context/LanguageContext';

interface FilterState {
  location: string;
  priceRange: [number, number];
  ratings: number[];
  roomTypes: string[];
  amenities: string[];
  sortBy: string;
}

const AccommodationSearch: React.FC = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [savedAccommodations, setSavedAccommodations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    location: 'nearby',
    priceRange: [500, 5000],
    ratings: [],
    roomTypes: [],
    amenities: [],
    sortBy: 'relevance'
  });

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Mock accommodation data
  const accommodations = [
    {
      id: '1',
      name: getLocalizedText('Divine Stay Hotel', 'दिव्य स्टे होटल', 'दिव्य स्टे हॉटेल'),
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400',
      rating: 4.5,
      pricePerNight: 1200,
      distance: 0.5,
      tags: [
        getLocalizedText('Near Temple', 'मंदिर के पास', 'मंदिराजवळ'),
        getLocalizedText('Family-Friendly', 'पारिवारिक', 'कुटुंबासाठी')
      ],
      amenities: ['wifi', 'parking', 'meals', 'ac', 'helpdesk']
    },
    {
      id: '2',
      name: getLocalizedText('Pilgrim Comfort Inn', 'पिल्ग्रिम कम्फर्ट इन', 'पिल्ग्रिम कम्फर्ट इन'),
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
      rating: 4.2,
      pricePerNight: 800,
      distance: 1.2,
      tags: [
        getLocalizedText('Food Included', 'भोजन शामिल', 'जेवण समाविष्ट'),
        getLocalizedText('Budget-Friendly', 'बजट फ्रेंडली', 'बजेट फ्रेंडली')
      ],
      amenities: ['wifi', 'meals', 'hot-water', 'helpdesk']
    },
    {
      id: '3',
      name: getLocalizedText('Sacred Valley Resort', 'सेक्रेड वैली रिसॉर्ट', 'सेक्रेड व्हॅली रिसॉर्ट'),
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
      rating: 4.8,
      pricePerNight: 2500,
      distance: 2.1,
      tags: [
        getLocalizedText('Luxury', 'लक्जरी', 'लक्झरी'),
        getLocalizedText('Pool', 'पूल', 'पूल')
      ],
      amenities: ['wifi', 'parking', 'meals', 'ac', 'hot-water', 'helpdesk']
    },
    {
      id: '4',
      name: getLocalizedText('Peace Guest House', 'पीस गेस्ट हाउस', 'पीस गेस्ट हाउस'),
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400',
      rating: 3.9,
      pricePerNight: 600,
      distance: 0.8,
      tags: [
        getLocalizedText('Quiet', 'शांत', 'शांत'),
        getLocalizedText('Garden View', 'गार्डन व्यू', 'गार्डन व्यू')
      ],
      amenities: ['wifi', 'meals', 'hot-water']
    },
    {
      id: '5',
      name: getLocalizedText('Nashik Heritage Hotel', 'नासिक हेरिटेज होटल', 'नाशिक हेरिटेज हॉटेल'),
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400',
      rating: 4.6,
      pricePerNight: 1800,
      distance: 1.5,
      tags: [
        getLocalizedText('Heritage', 'हेरिटेज', 'हेरिटेज'),
        getLocalizedText('Cultural', 'सांस्कृतिक', 'सांस्कृतिक')
      ],
      amenities: ['wifi', 'parking', 'meals', 'ac', 'helpdesk']
    },
    {
      id: '6',
      name: getLocalizedText('Spiritual Retreat', 'स्पिरिचुअल रिट्रीट', 'स्पिरिच्युअल रिट्रीट'),
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400',
      rating: 4.3,
      pricePerNight: 1000,
      distance: 3.2,
      tags: [
        getLocalizedText('Meditation', 'ध्यान', 'ध्यान'),
        getLocalizedText('Peaceful', 'शांतिपूर्ण', 'शांततापूर्ण')
      ],
      amenities: ['wifi', 'meals', 'hot-water', 'helpdesk']
    }
  ];

  const filteredAccommodations = accommodations.filter(accommodation => {
    // Search query filter
    if (searchQuery && !accommodation.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Price range filter
    if (accommodation.pricePerNight < filters.priceRange[0] || accommodation.pricePerNight > filters.priceRange[1]) {
      return false;
    }

    // Rating filter
    if (filters.ratings.length > 0 && !filters.ratings.some(rating => accommodation.rating >= rating)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.pricePerNight - b.pricePerNight;
      case 'price-high':
        return b.pricePerNight - a.pricePerNight;
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distance - b.distance;
      default:
        return 0;
    }
  });

  const handleBookNow = (accommodation: any) => {
    setSelectedAccommodation(accommodation);
    setIsBookingModalOpen(true);
  };

  const handleSaveForLater = (id: string) => {
    setSavedAccommodations(prev => 
      prev.includes(id) 
        ? prev.filter(savedId => savedId !== id)
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({
      location: 'nearby',
      priceRange: [500, 5000],
      ratings: [],
      roomTypes: [],
      amenities: [],
      sortBy: 'relevance'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pilgrim-brown mb-2">
          {getLocalizedText('Find Your Perfect Stay in Nashik', 'नासिक में अपना परफेक्ट स्टे खोजें', 'नाशिकमध्ये तुमचा परफेक्ट स्टे शोधा')}
        </h1>
        <p className="text-gray-600">
          {getLocalizedText(
            'Discover comfortable and pilgrim-friendly accommodations near sacred temples',
            'पवित्र मंदिरों के पास आरामदायक और तीर्थयात्री-अनुकूल आवास खोजें',
            'पवित्र मंदिरांजवळ आरामदायक आणि यात्रेकरू-अनुकूल निवास शोधा'
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={getLocalizedText('Search hotels, locations...', 'होटल, स्थान खोजें...', 'हॉटेल, स्थान शोधा...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setViewMode('grid')}
          className="px-4"
        >
          <Grid className="h-4 w-4 mr-2" />
          {getLocalizedText('Grid', 'ग्रिड', 'ग्रिड')}
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          onClick={() => setViewMode('map')}
          className="px-4"
        >
          <MapIcon className="h-4 w-4 mr-2" />
          {getLocalizedText('Map', 'मैप', 'मॅप')}
        </Button>
      </div>

      {/* Emergency Alert */}
      <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">
                {getLocalizedText('Weather Alert', 'मौसम अलर्ट', 'हवामान सूचना')}
              </h4>
              <p className="text-sm text-yellow-700">
                {getLocalizedText(
                  'Heavy rainfall expected in Nashik region. Some areas may experience flooding.',
                  'नासिक क्षेत्र में भारी बारिश की उम्मीद। कुछ क्षेत्रों में बाढ़ आ सकती है।',
                  'नाशिक प्रदेशात जोरदार पाऊस अपेक्षित. काही भागात पूर येऊ शकतो.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Filter Panel */}
        <div className="w-80 flex-shrink-0">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-pilgrim-brown">
                {filteredAccommodations.length} {getLocalizedText('accommodations found', 'आवास मिले', 'निवासस्थान सापडले')}
              </h2>
              {savedAccommodations.length > 0 && (
                <Badge variant="secondary" className="mt-1">
                  {savedAccommodations.length} {getLocalizedText('saved', 'सेव किए गए', 'सेव्ह केलेले')}
                </Badge>
              )}
            </div>
          </div>

          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredAccommodations.map(accommodation => (
                <AccommodationCard
                  key={accommodation.id}
                  {...accommodation}
                  onBookNow={handleBookNow}
                  onSaveForLater={handleSaveForLater}
                  isSaved={savedAccommodations.includes(accommodation.id)}
                />
              ))}
            </div>
          ) : (
            /* Map View Placeholder */
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {getLocalizedText('Map View', 'मैप व्यू', 'मॅप व्यू')}
                </h3>
                <p className="text-gray-500">
                  {getLocalizedText('Map integration coming soon', 'मैप इंटीग्रेशन जल्द आ रहा है', 'मॅप इंटिग्रेशन लवकरच')}
                </p>
              </div>
            </Card>
          )}

          {filteredAccommodations.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {getLocalizedText('No accommodations found', 'कोई आवास नहीं मिला', 'कोणतेही निवासस्थान सापडले नाही')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {getLocalizedText('Try adjusting your filters or search criteria', 'अपने फ़िल्टर या खोज मानदंड को समायोजित करने का प्रयास करें', 'तुमचे फिल्टर किंवा शोध निकष समायोजित करण्याचा प्रयत्न करा')}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  {getLocalizedText('Clear All Filters', 'सभी फ़िल्टर साफ़ करें', 'सर्व फिल्टर साफ करा')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        accommodation={selectedAccommodation}
      />
    </div>
  );
};

export default AccommodationSearch;
