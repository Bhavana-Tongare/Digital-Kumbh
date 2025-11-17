
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  clothing: z.string().optional(),
  foundLocation: z.string().min(5, {
    message: "Please provide a more detailed location.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ReportFound: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      clothing: "",
      foundLocation: "",
      category: "",
      notes: "",
    },
  });

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoUrl(e.target.result as string);
          toast({
            title: getLocalizedText(
              "Photo uploaded", 
              "फोटो अपलोड किया गया", 
              "फोटो अपलोड केला"
            ),
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: getLocalizedText(
          "Please log in to submit a report",
          "रिपोर्ट जमा करने के लिए कृपया लॉग इन करें",
          "अहवाल सबमिट करण्यासाठी कृपया लॉग इन करा"
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        user_id: user.id,
        name: data.name || null,
        age: data.age ? parseInt(data.age, 10) : null,
        gender: data.gender || null,
        clothing: data.clothing || null,
        found_location: data.foundLocation,
        found_time: new Date().toISOString(),
        category: data.category,
        status: 'pending',
        notes: data.notes || null,
        photo: photoUrl,
      };

      console.log('Submitting found report:', reportData);

      const { data: insertedData, error } = await supabase
        .from('found_person_reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Found report submitted successfully:', insertedData);
      
      toast({
        title: getLocalizedText(
          "Report Submitted Successfully", 
          "रिपोर्ट सफलतापूर्वक जमा की गई", 
          "अहवाल यशस्वीरित्या सबमिट केला"
        ),
        description: getLocalizedText(
          "Authorities have been notified and will contact you.", 
          "अधिकारियों को सूचित कर दिया गया है और वे आपसे संपर्क करेंगे।", 
          "अधिकाऱ्यांना सूचित करण्यात आले आहे आणि ते आपल्याशी संपर्क साधतील."
        ),
      });

      navigate('/my-reports');
    } catch (error) {
      console.error('Error submitting found report:', error);
      toast({
        title: getLocalizedText(
          "Error Submitting Report", 
          "रिपोर्ट जमा करने में त्रुटि", 
          "अहवाल सबमिट करताना त्रुटी"
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = getLocalizedText(
    "Report Found Person",
    "मिले हुए व्यक्ति की सूचना दें",
    "सापडलेल्या व्यक्तीची माहिती द्या"
  );

  return (
    <DashboardLayout title={pageTitle}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {getLocalizedText(
              "Please provide as much detail as possible about the person you found",
              "कृपया आपको मिले व्यक्ति के बारे में जितनी हो सके उतनी जानकारी प्रदान करें",
              "कृपया तुम्हाला सापडलेल्या व्यक्तीबद्दल शक्य तितकी माहिती द्या"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <div 
                  className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden border-2 border-dashed border-gray-400 cursor-pointer"
                  onClick={handleClickUpload}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Person" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-10 w-10 text-gray-500" />
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleClickUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {getLocalizedText(
                    "Upload Photo",
                    "फोटो अपलोड करें",
                    "फोटो अपलोड करा"
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getLocalizedText("Name", "नाम", "नाव")}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getLocalizedText("Approx. Age", "अनुमानित आयु", "अंदाजे वय")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getLocalizedText("Gender", "लिंग", "लिंग")}
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={getLocalizedText(
                              "Select gender", 
                              "लिंग चुनें", 
                              "लिंग निवडा"
                            )} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">
                            {getLocalizedText("Male", "पुरुष", "पुरुष")}
                          </SelectItem>
                          <SelectItem value="female">
                            {getLocalizedText("Female", "महिला", "स्त्री")}
                          </SelectItem>
                          <SelectItem value="other">
                            {getLocalizedText("Other", "अन्य", "इतर")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getLocalizedText("Category", "श्रेणी", "श्रेणी")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={getLocalizedText(
                              "Select category", 
                              "श्रेणी चुनें", 
                              "श्रेणी निवडा"
                            )} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="child">
                            {getLocalizedText("Child", "बच्चा", "बालक")}
                          </SelectItem>
                          <SelectItem value="adult">
                            {getLocalizedText("Adult", "वयस्क", "प्रौढ")}
                          </SelectItem>
                          <SelectItem value="elderly">
                            {getLocalizedText("Elderly", "बुजुर्ग", "वृद्ध")}
                          </SelectItem>
                          <SelectItem value="disabled">
                            {getLocalizedText("Disabled", "विकलांग", "दिव्यांग")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clothing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getLocalizedText(
                        "Clothing Description", 
                        "कपड़ों का विवरण", 
                        "कपड्यांचे वर्णन"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={getLocalizedText(
                          "Describe what the person was wearing", 
                          "बताएं कि व्यक्ति क्या पहने हुए था", 
                          "व्यक्ती काय घातले होते याचे वर्णन करा"
                        )} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getLocalizedText(
                        "Found Location", 
                        "मिलने का स्थान", 
                        "सापडलेले ठिकाण"
                      )} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={getLocalizedText(
                          "Provide as much detail as possible about where the person was found", 
                          "जहां व्यक्ति मिला था, उसके बारे में यथासंभव विस्तार से बताएं", 
                          "व्यक्ती कोठे सापडली होती याबद्दल शक्य तितका तपशील द्या"
                        )} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getLocalizedText(
                        "Additional Notes", 
                        "अतिरिक्त नोट्स", 
                        "अतिरिक्त नोंदी"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={getLocalizedText(
                          "Any other information that might help (condition, behavior, etc.)", 
                          "कोई अन्य जानकारी जो मदद कर सकती है (स्थिति, व्यवहार, आदि)", 
                          "इतर कोणतीही माहिती जी मदत करू शकेल (स्थिती, वर्तन, इ.)"
                        )} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/user-dashboard')}
                  disabled={isSubmitting}
                >
                  {getLocalizedText("Cancel", "रद्द करें", "रद्द करा")}
                </Button>
                <Button 
                  type="submit"
                  className="bg-pilgrim-orange hover:bg-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSubmitting 
                    ? getLocalizedText("Submitting...", "जमा कर रहे हैं...", "सबमिट करत आहे...")
                    : getLocalizedText("Submit Report", "रिपोर्ट जमा करें", "अहवाल सबमिट करा")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ReportFound;
