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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Please enter a valid age.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  clothing: z.string().min(5, {
    message: "Please describe clothing in more detail.",
  }),
  lastSeenLocation: z.string().min(5, {
    message: "Please provide a more detailed location.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ReportMissing: React.FC = () => {
  const { translate, language } = useLanguage();
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
      lastSeenLocation: "",
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
        name: data.name,
        age: parseInt(data.age, 10),
        gender: data.gender,
        clothing: data.clothing,
        last_seen_location: data.lastSeenLocation,
        last_seen_time: new Date().toISOString(),
        category: data.category,
        status: 'pending',
        notes: data.notes || null,
        photo: photoUrl,
        user_id: user.id,
      };

      console.log('Submitting report data:', reportData);

      const { data: insertedData, error } = await supabase
        .from('lost_person_reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Report submitted successfully:', insertedData);

      toast({
        title: getLocalizedText(
          "Report submitted successfully", 
          "रिपोर्ट सफलतापूर्वक जमा की गई", 
          "अहवाल यशस्वीरित्या सबमिट केला"
        ),
        description: getLocalizedText(
          "We will process your report and notify you of any updates", 
          "हम आपकी रिपोर्ट संसाधित करेंगे और आपको किसी भी अपडेट की सूचना देंगे", 
          "आम्ही तुमचा अहवाल प्रक्रिया करू आणि तुम्हाला कोणत्याही अपडेट्सबद्दल सूचित करू"
        ),
      });

      navigate('/my-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: getLocalizedText(
          "Error submitting report",
          "रिपोर्ट जमा करने में त्रुटि",
          "अहवाल सबमिट करताना त्रुटी"
        ),
        description: getLocalizedText(
          "Please try again later",
          "कृपया बाद में पुनः प्रयास करें",
          "कृपया नंतर पुन्हा प्रयत्न करा"
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = getLocalizedText(
    "Report Missing Person",
    "लापता व्यक्ति की रिपोर्ट करें",
    "हरवलेल्या व्यक्तीची तक्रार करा"
  );

  return (
    <DashboardLayout title={pageTitle}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {getLocalizedText(
              "Please provide as much detail as possible to help find the missing person",
              "लापता व्यक्ति को खोजने में मदद करने के लिए कृपया यथासंभव विस्तार से जानकारी प्रदान करें",
              "हरवलेल्या व्यक्तीला शोधण्यात मदत करण्यासाठी कृपया शक्य तितका तपशील प्रदान करा"
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
                        {getLocalizedText("Age", "उम्र", "वय")}
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
                        {getLocalizedText("Category", "श्रेणी", "श्रेणी")}
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
                            {getLocalizedText("Child (0-12)", "बच्चा (0-12)", "बालक (0-12)")}
                          </SelectItem>
                          <SelectItem value="teen">
                            {getLocalizedText("Teen (13-17)", "किशोर (13-17)", "किशोर (13-17)")}
                          </SelectItem>
                          <SelectItem value="adult">
                            {getLocalizedText("Adult (18-59)", "वयस्क (18-59)", "प्रौढ (18-59)")}
                          </SelectItem>
                          <SelectItem value="elderly">
                            {getLocalizedText("Elderly (60+)", "बुजुर्ग (60+)", "वृद्ध (60+)")}
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
                          "व्यक्ती काय घातले होते याबद्दल शक्य तितका तपशील द्या"
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
                name="lastSeenLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {getLocalizedText(
                        "Last Seen Location", 
                        "आखिरी बार देखे जाने का स्थान", 
                        "शेवटचे दिसलेले ठिकाण"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={getLocalizedText(
                          "Provide as much detail as possible about where the person was last seen", 
                          "जहां व्यक्ति को आखिरी बार देखा गया था, उसके बारे में यथासंभव विस्तार से बताएं", 
                          "व्यक्ती शेवटी कोठे दिसली होती याबद्दल शक्य तितका तपशील द्या"
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
                          "Any other information that might help (medical conditions, personal items, etc.)", 
                          "कोई अन्य जानकारी जो मदद कर सकती है (चिकित्सा स्थितियां, व्यक्तिगत वस्तुएं, आदि)", 
                          "इतर कोणतीही माहिती जी मदत करू शकेल (वैद्यकीय स्थिती, वैयक्तिक वस्तू, इ.)"
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

export default ReportMissing;
