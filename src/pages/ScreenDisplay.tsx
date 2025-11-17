import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface LostPersonReport {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo: string | null;
  clothing: string;
  last_seen_location: string;
  last_seen_time: string;
}

const ScreenDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const screenId = searchParams.get('screen_id');
  const mode = searchParams.get('mode');
  const intervalSec = Number(searchParams.get('interval') || '30');
  const blink = searchParams.get('blink') === '1';
  const { language } = useLanguage();
  const [report, setReport] = useState<LostPersonReport | null>(null);
  const [reports, setReports] = useState<LostPersonReport[]>([]);
  const [index, setIndex] = useState(0);
  const [screenName, setScreenName] = useState<string>('');

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Heartbeat function to update screen status
  useEffect(() => {
    if (!screenId) return;

    const heartbeat = async () => {
      try {
        await supabase
          .from('screen_status')
          .upsert({
            id: screenId,
            last_active: new Date().toISOString(),
            status: 'online'
          }, { onConflict: 'id' });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    // Ping immediately and then every 10 seconds
    heartbeat();
    const heartbeatInterval = setInterval(heartbeat, 10000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [screenId]);

  useEffect(() => {
    if (!screenId) return;

    const fetchScreenDisplay = async () => {
      try {
        if (mode === 'all_lost') {
          const { data: lostData, error: lostError } = await supabase
            .from('lost_person_reports')
            .select('*')
            .eq('status', 'under_review')
            .order('created_at', { ascending: false });
          if (lostError) throw lostError;
          setReports((lostData || []) as any);
          setReport((lostData && lostData[0]) as any || null);
          setScreenName('All Screens Playlist');
          return;
        }
        const { data: screenDisplay, error: screenError } = await supabase
          .from('screen_displays')
          .select('*, lost_person_reports(*)')
          .eq('screen_id', screenId)
          .single();

        if (screenError) {
          console.error('Error fetching screen display:', screenError);
          return;
        }

        if (screenDisplay?.lost_person_reports) {
          setReport(screenDisplay.lost_person_reports as any);
          setScreenName(screenDisplay.screen_name);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchScreenDisplay();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('screen-display-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'screen_displays',
          filter: `screen_id=eq.${screenId}`
        },
        async (payload) => {
          console.log('Screen display updated:', payload);
          
          if (payload.new && 'report_id' in payload.new) {
            const { data: reportData, error } = await supabase
              .from('lost_person_reports')
              .select('*')
              .eq('id', payload.new.report_id)
              .single();

            if (!error && reportData) {
              setReport(reportData as any);
              setScreenName((payload.new as any).screen_name);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [screenId, mode]);

  useEffect(() => {
    if (mode !== 'all_lost' || reports.length === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % reports.length;
        setReport(reports[next]);
        return next;
      });
    }, Math.max(5, intervalSec) * 1000);
    return () => clearInterval(id);
  }, [mode, reports, intervalSec]);

  if (!screenId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">
            {getLocalizedText('Error', 'त्रुटि', 'त्रुटी')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {getLocalizedText(
              'No screen ID provided. Please scan the QR code.',
              'कोई स्क्रीन आईडी प्रदान नहीं की गई। कृपया QR कोड स्कैन करें।',
              'कोणतीही स्क्रीन आयडी प्रदान केलेली नाही. कृपया QR कोड स्कॅन करा.'
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            {getLocalizedText('Waiting for content...', 'सामग्री की प्रतीक्षा में...', 'सामग्रीची प्रतीक्षा...')}
          </h1>
          <p className="text-muted-foreground">
            {screenName && `Screen: ${screenName}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className={`text-4xl font-bold text-destructive ${blink ? 'animate-pulse' : ''}`}>
            {getLocalizedText('MISSING PERSON ALERT', 'लापता व्यक्ति अलर्ट', 'हरवलेली व्यक्ती सूचना')}
          </h1>
          {screenName && (
            <p className="text-lg text-muted-foreground mt-2">
              {screenName}
            </p>
          )}
        </div>

        <Card className="shadow-2xl border-4 border-destructive">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Photo Section */}
              <div className="flex items-center justify-center">
                {report.photo ? (
                  <img
                    src={report.photo}
                    alt={report.name}
                    className="w-full max-w-md h-auto rounded-lg shadow-lg object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-full max-w-md h-96 bg-muted rounded-lg flex items-center justify-center border-4 border-muted-foreground">
                    <p className="text-muted-foreground text-xl">
                      {getLocalizedText('No photo available', 'कोई फोटो उपलब्ध नहीं', 'फोटो उपलब्ध नाही')}
                    </p>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-4">{report.name}</h2>
                </div>

                <div className="space-y-4 text-lg">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">
                      {getLocalizedText('Age', 'उम्र', 'वय')}:
                    </span>
                    <span className="text-xl font-bold">{report.age}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">
                      {getLocalizedText('Gender', 'लिंग', 'लिंग')}:
                    </span>
                    <span className="text-xl">{report.gender}</span>
                  </div>

                  <div className="border-b pb-2">
                    <span className="font-semibold block mb-2">
                      {getLocalizedText('Clothing', 'पहनावा', 'पोशाख')}:
                    </span>
                    <p className="text-base">{report.clothing}</p>
                  </div>

                  <div className="border-b pb-2">
                    <span className="font-semibold block mb-2">
                      {getLocalizedText('Last Seen Location', 'अंतिम बार देखा गया', 'शेवटचे पाहिलेले ठिकाण')}:
                    </span>
                    <p className="text-base font-semibold text-destructive">{report.last_seen_location}</p>
                  </div>

                  <div className="border-b pb-2">
                    <span className="font-semibold block mb-2">
                      {getLocalizedText('Last Seen Time', 'अंतिम समय', 'शेवटची वेळ')}:
                    </span>
                    <p className="text-base">
                      {new Date(report.last_seen_time).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary">
                  <p className="text-center text-lg font-semibold">
                    {getLocalizedText(
                      'If you have any information, please contact the nearest authority',
                      'यदि आपके पास कोई जानकारी है, तो कृपया निकटतम अधिकारी से संपर्क करें',
                      'तुम्हाला काही माहिती असल्यास, कृपया जवळच्या प्राधिकरणाशी संपर्क साधा'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScreenDisplay;
