
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Phone, User, Loader2 } from 'lucide-react';

interface FoundByAuthorityCardProps {
  foundBy: string;
  className?: string;
}

interface AuthorityProfile {
  id: string;
  full_name: string;
  phone_number: string;
}

const FoundByAuthorityCard: React.FC<FoundByAuthorityCardProps> = ({ foundBy, className = "" }) => {
  const { language } = useLanguage();
  const [authorityProfile, setAuthorityProfile] = useState<AuthorityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  useEffect(() => {
    const fetchAuthorityProfile = async () => {
      if (!foundBy) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching authority profile for:', foundBy);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .eq('id', foundBy)
          .maybeSingle();

        if (profileError) {
          console.error('❌ Error fetching authority profile:', profileError);
          setError('Unable to fetch authority details');
        } else if (profile) {
          console.log('✅ Authority profile fetched:', profile);
          setAuthorityProfile(profile);
        }
      } catch (err) {
        console.error('💥 Error in fetchAuthorityProfile:', err);
        setError('Failed to load authority information');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorityProfile();
  }, [foundBy]);

  if (!foundBy) {
    return null;
  }

  if (loading) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-green-600 mr-2" />
            <span className="text-sm text-green-700">
              {getLocalizedText(
                "Loading authority details...",
                "प्राधिकरण विवरण लोड हो रहे हैं...",
                "अधिकारी तपशील लोड होत आहेत..."
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !authorityProfile) {
    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center">
            <User className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-700">
              {getLocalizedText(
                "Authority information not available",
                "प्राधिकरण की जानकारी उपलब्ध नहीं है",
                "अधिकारी माहिती उपलब्ध नाही"
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
          👮 {getLocalizedText("Found By Authority", "प्राधिकरण द्वारा मिला", "अधिकाऱ्याकडून सापडले")}
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-green-700">
            <User className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">
              {getLocalizedText("Name:", "नाम:", "नाव:")}
            </span>
            <span className="ml-2">{authorityProfile.full_name || 'Not provided'}</span>
          </div>
          
          {authorityProfile.phone_number && (
            <div className="flex items-center text-sm text-green-700">
              <Phone className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">
                {getLocalizedText("Contact:", "संपर्क:", "संपर्क:")}
              </span>
              <span className="ml-2">{authorityProfile.phone_number}</span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-green-600 mt-3 italic">
          {getLocalizedText(
            "Contact the authority for coordination regarding your found person.",
            "अपने पाए गए व्यक्ति के संबंध में समन्वय के लिए अधिकारी से संपर्क करें।",
            "तुमच्या सापडलेल्या व्यक्तीबद्दल समन्वयासाठी अधिकाऱ्याशी संपर्क साधा."
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default FoundByAuthorityCard;
