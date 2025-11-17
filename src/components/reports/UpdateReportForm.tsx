
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from "@/hooks/use-toast";
import { LostPersonReport } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface UpdateReportFormProps {
  report: LostPersonReport;
  open: boolean;
  onClose: () => void;
}

const UpdateReportForm: React.FC<UpdateReportFormProps> = ({ report, open, onClose }) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: report.name,
    age: report.age,
    gender: report.gender,
    clothing: report.clothing,
    lastSeenLocation: report.lastSeenLocation,
    category: report.category || 'adult',
    notes: report.notes || '',
  });

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('lost_person_reports')
        .update({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          clothing: formData.clothing,
          last_seen_location: formData.lastSeenLocation,
          category: formData.category,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) {
        console.error('Error updating report:', error);
        throw error;
      }
      
      toast({
        title: getLocalizedText(
          "Report Updated",
          "रिपोर्ट अपडेट की गई",
          "अहवाल अपडेट केला"
        ),
        description: getLocalizedText(
          "The report has been successfully updated",
          "रिपोर्ट सफलतापूर्वक अपडेट की गई है",
          "अहवाल यशस्वीरित्या अपडेट केला गेला आहे"
        ),
      });
      
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: getLocalizedText(
          "Update Failed",
          "अपडेट विफल",
          "अपडेट अयशस्वी"
        ),
        description: getLocalizedText(
          "Failed to update the report. Please try again.",
          "रिपोर्ट अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
          "अहवाल अपडेट करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>
              {getLocalizedText(
                "Update Report",
                "रिपोर्ट अपडेट करें",
                "अहवाल अपडेट करा"
              )}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {getLocalizedText("Name", "नाम", "नाव")}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">
                    {getLocalizedText("Age", "उम्र", "वय")}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    {getLocalizedText("Gender", "लिंग", "लिंग")}
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "male" | "female" | "other") => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={getLocalizedText("Select gender", "लिंग चुनें", "लिंग निवडा")} />
                    </SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    {getLocalizedText("Category", "श्रेणी", "श्रेणी")}
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: "child" | "elderly" | "disabled" | "adult") => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={getLocalizedText("Select category", "श्रेणी चुनें", "श्रेणी निवडा")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">
                        {getLocalizedText("Child", "बच्चा", "बाल")}
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clothing">
                  {getLocalizedText("Clothing", "कपड़े", "कपडे")}
                </Label>
                <Input
                  id="clothing"
                  value={formData.clothing}
                  onChange={(e) => setFormData(prev => ({ ...prev, clothing: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastSeenLocation">
                  {getLocalizedText("Last Seen Location", "आखिरी बार देखे जाने का स्थान", "शेवटचं दिसलेलं ठिकाण")}
                </Label>
                <Input
                  id="lastSeenLocation"
                  value={formData.lastSeenLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {getLocalizedText("Additional Notes", "अतिरिक्त नोट्स", "अतिरिक्त टिपा")}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                    {getLocalizedText("Updating...", "अपडेट हो रहा है...", "अपडेट होत आहे...")}
                  </>
                ) : (
                  getLocalizedText("Update Report", "रिपोर्ट अपडेट करें", "अहवाल अपडेट करा")
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateReportForm;
