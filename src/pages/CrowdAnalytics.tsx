import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface CrowdSampleRow {
  place_name: string;
  count: number;
  status: 'Green' | 'Yellow' | 'Red';
  captured_at: string;
}

const CrowdAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [samples, setSamples] = useState<CrowdSampleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const t = (eng: string, hi: string, mr: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hi;
    return mr;
  };

  useEffect(() => {
    loadDay(selectedDate);
  }, [selectedDate]);

  const loadDay = async (dateStr: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crowd_samples')
        .select('place_name, count, status, captured_at')
        .eq('date', dateStr)
        .order('captured_at', { ascending: true });
      if (error) throw error;
      const rows = (data as CrowdSampleRow[]) || [];
      // Fallback demo if empty
      if (rows.length === 0) {
        const demo: CrowdSampleRow[] = [
          { place_name: 'Temple', count: 4, status: 'Yellow', captured_at: `${dateStr}T09:00:00Z` },
          { place_name: 'Food Court', count: 2, status: 'Green', captured_at: `${dateStr}T10:00:00Z` },
          { place_name: 'Ghat', count: 6, status: 'Yellow', captured_at: `${dateStr}T11:00:00Z` },
          { place_name: 'Railway Station', count: 8, status: 'Red', captured_at: `${dateStr}T12:00:00Z` },
        ];
        setSamples(demo);
      } else {
        setSamples(rows);
      }
    } catch (e) {
      console.error('Failed loading day samples', e);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  const totalForDay = samples.reduce((sum, s) => sum + (s.count || 0), 0);

  const perCameraTotals: Record<string, number> = samples.reduce((acc, s) => {
    acc[s.place_name] = (acc[s.place_name] || 0) + (s.count || 0);
    return acc;
  }, {} as Record<string, number>);

  const downloadReport = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const w = window.open('', '_blank');
      if (!w) return;
      const title = t('Crowd Report', 'भीड़ रिपोर्ट', 'गर्दी अहवाल');
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title} - ${selectedDate}</title>
        <style>
          body{font-family: Arial, sans-serif; padding:24px;}
          h1{margin:0 0 8px 0}
          .meta{color:#555;margin-bottom:16px}
          table{border-collapse:collapse;width:100%;}
          th,td{border:1px solid #ddd;padding:8px;font-size:12px}
          th{background:#f5f5f5;text-align:left}
        </style>
      </head><body>`);
      w.document.write(`<h1>${title}</h1>`);
      w.document.write(`<div class="meta">${t('Date','तारीख','तारीख')}: ${selectedDate}</div>`);
      w.document.write(`<div class="meta"><strong>${t('Total Count (00:00–23:59)','कुल गिनती (00:00–23:59)','एकूण गणना (00:00–23:59)')}:</strong> ${totalForDay}</div>`);
      // Per-camera totals
      const cameraNames = Object.keys(perCameraTotals);
      if (cameraNames.length > 0) {
        w.document.write('<h3>Per Camera Totals</h3>');
        w.document.write('<table><thead><tr><th>Camera/Place</th><th>Total Count</th></tr></thead><tbody>');
        cameraNames.forEach(name => {
          w.document.write(`<tr><td>${name}</td><td>${perCameraTotals[name]}</td></tr>`);
        });
        w.document.write('</tbody></table>');
      }
      // Detailed rows
      w.document.write('<h3 style="margin-top:20px">Details</h3>');
      w.document.write('<table><thead><tr><th>Time</th><th>Camera/Place</th><th>Count</th><th>Status</th></tr></thead><tbody>');
      samples.forEach(s => {
        const time = new Date(s.captured_at).toLocaleTimeString();
        w.document.write(`<tr><td>${time}</td><td>${s.place_name}</td><td>${s.count}</td><td>${s.status}</td></tr>`);
      });
      w.document.write('</tbody></table>');
      w.document.write('</body></html>');
      w.document.close();
      w.focus();
      w.print();
    } catch (e) {
      console.error('Report generation failed', e);
      alert(t('Failed to generate report.','रिपोर्ट बनाने में विफल।','अहवाल तयार करण्यात अयशस्वी.'));
    } finally {
      setDownloading(false);
    }
  };


  return (
    <DashboardLayout title={t('Crowd Analytics', 'भीड़ विश्लेषण', 'गर्दी विश्लेषण')}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={downloadReport} disabled={downloading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {downloading ? t('Preparing...','तैयार किया जा रहा है...','तयार करत आहोत...') : t('Download Report','रिपोर्ट डाउनलोड करें','अहवाल डाउनलोड करा')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('Overall Crowd Count (Selected Date)', 'कुल भीड़ गिनती (चयनित तारीख)', 'एकूण गर्दी गणना (निवडलेली तारीख)')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 flex items-center justify-center">Loading...</div>
            ) : (
              <div className="text-3xl font-bold">{totalForDay}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Per Camera Totals', 'प्रत्येक कैमरा कुल', 'प्रत्येक कॅमेराचे एकूण')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center">Loading...</div>
            ) : Object.keys(perCameraTotals).length === 0 ? (
              <div className="text-gray-500">{t('No data for selected date','चयनित तारीख के लिए डेटा नहीं','निवडलेल्या तारखेकरिता डेटा नाही')}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Camera/Place','कैमरा/स्थान','कॅमेरा/स्थान')}</TableHead>
                      <TableHead>{t('Total Count','कुल गिनती','एकूण संख्या')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(perCameraTotals).map(([name, total]) => (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('All Samples (Selected Date)', 'सभी नमूने (चयनित तारीख)', 'सर्व नमुने (निवडलेली तारीख)')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">Loading...</div>
            ) : samples.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-gray-500">{t('No data yet','अभी तक कोई डेटा नहीं','अजून डेटा नाही')}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Time', 'समय', 'वेळ')}</TableHead>
                      <TableHead>{t('Camera/Place', 'कैमरा/स्थान', 'कॅमेरा/स्थान')}</TableHead>
                      <TableHead>{t('Count', 'गिनती', 'संख्या')}</TableHead>
                      <TableHead>{t('Status', 'स्थिति', 'स्थिती')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samples.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{new Date(s.captured_at).toLocaleTimeString()}</TableCell>
                        <TableCell>{s.place_name}</TableCell>
                        <TableCell>{s.count}</TableCell>
                        <TableCell>{s.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CrowdAnalytics;

