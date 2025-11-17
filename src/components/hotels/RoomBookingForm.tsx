
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Loader2, Users, CreditCard, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface RoomBookingFormProps {
  hotelName: string;
  roomType: string;
  roomPrice: number;
  capacity: number;
  onCancel: () => void;
  getLocalizedText: (eng: string, hindi: string, marathi: string) => string;
}

const RoomBookingForm: React.FC<RoomBookingFormProps> = ({
  hotelName,
  roomType,
  roomPrice,
  capacity,
  onCancel,
  getLocalizedText
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [guests, setGuests] = useState("1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast({
        title: getLocalizedText(
          "Required Fields Missing",
          "आवश्यक फ़ील्ड अनुपलब्ध",
          "आवश्यक फील्ड्स गहाळ"
        ),
        description: getLocalizedText(
          "Please fill all required fields",
          "कृपया सभी आवश्यक फ़ील्ड भरें",
          "कृपया सर्व आवश्यक फील्ड्स भरा"
        ),
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingSummary = {
        hotel: hotelName,
        room: roomType,
        price: roomPrice,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests),
        name,
        email,
        phone,
        paymentMethod
      };
      
      // Store booking in localStorage
      const existingBookings = JSON.parse(localStorage.getItem('roomBookings') || '[]');
      localStorage.setItem('roomBookings', JSON.stringify([...existingBookings, bookingSummary]));
      
      toast({
        title: getLocalizedText(
          "Booking Confirmed!",
          "बुकिंग की पुष्टि हो गई!",
          "बुकिंग पुष्टी झाली!"
        ),
        description: getLocalizedText(
          `Your booking at ${hotelName} has been confirmed.`,
          `${hotelName} में आपकी बुकिंग की पुष्टि हो गई है।`,
          `${hotelName} मध्ये तुमची बुकिंग पुष्टी झाली आहे.`
        ),
      });
      
      onCancel(); // Close the booking form
    } catch (error) {
      toast({
        title: getLocalizedText(
          "Booking Failed",
          "बुकिंग विफल",
          "बुकिंग अयशस्वी"
        ),
        description: getLocalizedText(
          "There was an error processing your booking.",
          "आपकी बुकिंग प्रोसेस करने में एक त्रुटि हुई थी।",
          "तुमची बुकिंग प्रक्रिया करताना त्रुटी आली."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const totalPrice = roomPrice * (checkOutDate && checkInDate ? 
    Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))) : 1);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {getLocalizedText(
            `Book ${roomType} at ${hotelName}`,
            `${hotelName} में ${roomType} बुक करें`,
            `${hotelName} मध्ये ${roomType} बुक करा`
          )}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in">
                {getLocalizedText("Check-in Date", "चेक-इन तिथि", "चेक-इन तारीख")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="check-in"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? (
                      format(checkInDate, "PPP")
                    ) : (
                      <span>{getLocalizedText("Select date", "तिथि चुनें", "तारीख निवडा")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="check-out">
                {getLocalizedText("Check-out Date", "चेक-आउट तिथि", "चेक-आउट तारीख")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="check-out"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? (
                      format(checkOutDate, "PPP")
                    ) : (
                      <span>{getLocalizedText("Select date", "तिथि चुनें", "तारीख निवडा")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    initialFocus
                    disabled={(date) => checkInDate ? date <= checkInDate : date <= new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guests">
              {getLocalizedText("Number of Guests", "अतिथियों की संख्या", "पाहुण्यांची संख्या")}
            </Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests" className="w-full">
                <SelectValue placeholder={getLocalizedText("Select guests", "अतिथि चुनें", "पाहुणे निवडा")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: capacity }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {getLocalizedText("Guest(s)", "अतिथि", "पाहुणे")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-lg">
              {getLocalizedText("Guest Information", "अतिथि जानकारी", "पाहुणा माहिती")}
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">
                {getLocalizedText("Full Name", "पूरा नाम", "पूर्ण नाव")} *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {getLocalizedText("Email", "ईमेल", "ईमेल")} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {getLocalizedText("Phone Number", "फोन नंबर", "फोन नंबर")} *
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-lg">
              {getLocalizedText("Payment Method", "भुगतान विधि", "पेमेंट पद्धत")}
            </h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {getLocalizedText("Credit/Debit Card", "क्रेडिट/डेबिट कार्ड", "क्रेडिट/डेबिट कार्ड")}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">
                  {getLocalizedText("UPI", "यूपीआई", "यूपीआय")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">
                  {getLocalizedText("Cash on Arrival", "आगमन पर नकद", "आगमनावर रोख")}
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>
                {getLocalizedText("Room Price", "कमरे की कीमत", "खोलीची किंमत")}:
              </span>
              <span>₹{roomPrice} × {checkOutDate && checkInDate ? 
                Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))) : 1} {getLocalizedText("night(s)", "रात", "रात्र")}
              </span>
            </div>
            <div className="flex justify-between items-center font-medium text-lg mt-2">
              <span>
                {getLocalizedText("Total Amount", "कुल राशि", "एकूण रक्कम")}:
              </span>
              <span className="text-pilgrim-orange">₹{totalPrice}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {getLocalizedText("Cancel", "रद्द करें", "रद्द करा")}
          </Button>
          <Button 
            type="submit"
            className="bg-pilgrim-orange hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getLocalizedText("Processing...", "प्रोसेसिंग...", "प्रक्रिया करत आहे...")}
              </>
            ) : (
              <>
                {getLocalizedText("Confirm Booking", "बुकिंग की पुष्टि करें", "बुकिंग पुष्टी करा")}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoomBookingForm;
