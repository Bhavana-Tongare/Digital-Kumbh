
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Wifi, Car, UtensilsCrossed, Snowflake, Phone, CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: {
    id: string;
    name: string;
    image: string;
    rating: number;
    pricePerNight: number;
    distance: number;
    tags: string[];
    amenities: string[];
  } | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, accommodation }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

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

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return getLocalizedText('Wi-Fi', 'वाई-फाई', 'वाई-फाई');
      case 'parking': return getLocalizedText('Parking', 'पार्किंग', 'पार्किंग');
      case 'meals': return getLocalizedText('Meals Included', 'भोजन शामिल', 'जेवण समाविष्ट');
      case 'ac': return getLocalizedText('Air Conditioning', 'ए/सी', 'ए/सी');
      case 'hot-water': return getLocalizedText('Hot Water', 'गर्म पानी', 'गरम पाणी');
      case 'helpdesk': return getLocalizedText('24x7 Helpdesk', '24x7 हेल्पडेस्क', '24x7 हेल्पडेस्क');
      default: return amenity;
    }
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return nights * (accommodation?.pricePerNight || 0);
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = () => {
    if (!checkInDate || !checkOutDate || !contactName || !contactPhone) {
      toast({
        title: getLocalizedText('Incomplete Information', 'अधूरी जानकारी', 'अपूर्ण माहिती'),
        description: getLocalizedText('Please fill all required fields', 'कृपया सभी आवश्यक फ़ील्ड भरें', 'कृपया सर्व आवश्यक फील्ड भरा'),
        variant: 'destructive'
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: getLocalizedText('Invalid Dates', 'गलत तारीखें', 'चुकीच्या तारखा'),
        description: getLocalizedText('Check-out date must be after check-in date', 'चेक-आउट तारीख चेक-इन तारीख के बाद होनी चाहिए', 'चेक-आउट तारीख चेक-इन तारीखेनंतर असावी'),
        variant: 'destructive'
      });
      return;
    }

    // Simulate booking success
    toast({
      title: getLocalizedText('Booking Confirmed!', 'बुकिंग पुष्ट!', 'बुकिंग पुष्टी!'),
      description: getLocalizedText(
        `Your stay at ${accommodation?.name} has been booked successfully. You will receive a confirmation SMS shortly.`,
        `${accommodation?.name} में आपका ठहरना सफलतापूर्वक बुक हो गया है। आपको जल्द ही पुष्टिकरण SMS मिलेगा।`,
        `${accommodation?.name} मध्ये तुमचा मुक्काम यशस्वीरीत्या बुक झाला आहे। तुम्हाला लवकरच पुष्टीकरण SMS मिळेल।`
      )
    });

    onClose();
  };

  if (!accommodation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-pilgrim-brown">
            {getLocalizedText('Book Your Stay', 'अपना ठहरना बुक करें', 'तुमचा मुक्काम बुक करा')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotel Details */}
          <div className="space-y-4">
            <img 
              src={accommodation.image} 
              alt={accommodation.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            
            <div>
              <h3 className="text-xl font-semibold text-pilgrim-brown mb-2">{accommodation.name}</h3>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{accommodation.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{accommodation.distance} {getLocalizedText('km away', 'किमी दूर', 'किमी दूर')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {accommodation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-pilgrim-brown">
                  {getLocalizedText('Amenities', 'सुविधाएं', 'सुविधा')}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {accommodation.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getAmenityIcon(amenity)}
                      <span>{getAmenityLabel(amenity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check-in">
                  {getLocalizedText('Check-in Date', 'चेक-इन तारीख', 'चेक-इन तारीख')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "PPP") : getLocalizedText('Pick a date', 'तारीख चुनें', 'तारीख निवडा')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="check-out">
                  {getLocalizedText('Check-out Date', 'चेक-आउट तारीख', 'चेक-आउट तारीख')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "PPP") : getLocalizedText('Pick a date', 'तारीख चुनें', 'तारीख निवडा')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => date <= (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="guests">
                {getLocalizedText('Number of Guests', 'मेहमानों की संख्या', 'पाहुण्यांची संख्या')}
              </Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact-name">
                {getLocalizedText('Contact Name', 'संपर्क नाम', 'संपर्क नाव')} *
              </Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={getLocalizedText('Enter your name', 'अपना नाम दर्ज करें', 'तुमचे नाव टाका')}
              />
            </div>

            <div>
              <Label htmlFor="contact-phone">
                {getLocalizedText('Phone Number', 'फ़ोन नंबर', 'फोन नंबर')} *
              </Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={getLocalizedText('Enter phone number', 'फ़ोन नंबर दर्ज करें', 'फोन नंबर टाका')}
              />
            </div>

            {/* Price Summary */}
            {checkInDate && checkOutDate && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-pilgrim-brown">
                  {getLocalizedText('Booking Summary', 'बुकिंग सारांश', 'बुकिंग सारांश')}
                </h4>
                <div className="flex justify-between text-sm">
                  <span>₹{accommodation.pricePerNight} × {calculateNights()} {getLocalizedText('nights', 'रातें', 'रात्री')}</span>
                  <span>₹{calculateTotalPrice()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>{getLocalizedText('Total', 'कुल', 'एकूण')}</span>
                  <span className="text-pilgrim-orange">₹{calculateTotalPrice()}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleBooking}
              className="w-full bg-pilgrim-orange hover:bg-pilgrim-orangeDark text-white"
              disabled={!checkInDate || !checkOutDate || !contactName || !contactPhone}
            >
              {getLocalizedText('Confirm Booking', 'बुकिंग पुष्ट करें', 'बुकिंग पुष्ट करा')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
