
import { useState, useEffect } from 'react';
import { LostPersonReport, FoundPersonReport } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export const useReportManagement = () => {
  const { language } = useLanguage();
  const [lostReports, setLostReports] = useState<LostPersonReport[]>([]);
  const [foundReports, setFoundReports] = useState<FoundPersonReport[]>([]);
  const [selectedLostReport, setSelectedLostReport] = useState<LostPersonReport | null>(null);
  const [selectedFoundReport, setSelectedFoundReport] = useState<FoundPersonReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getLocalizedText = (eng: string, hindi: string, marathi: string) => {
    if (language === 'english') return eng;
    if (language === 'hindi') return hindi;
    return marathi;
  };

  // Keep the hook focused on loading; avoid role updates during load path
  const ensureAuthorityRole = async () => {};

  useEffect(() => {
    const initializeAndLoadReports = async () => {
      await ensureAuthorityRole();
      await loadReports();
    };
    
    initializeAndLoadReports();

    const channel = supabase
      .channel('reports-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lost_person_reports'
        },
        (payload) => {
          console.log('Lost report changed:', payload);
          loadReports();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'found_person_reports'
        },
        (payload) => {
          console.log('Found report changed:', payload);
          loadReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      console.log('🔍 Authority Dashboard: Starting to load reports...');
      
      // Fetch both lists concurrently with minimal columns and a sane limit
      const [lostRes, foundRes] = await Promise.all([
        supabase
          .from('lost_person_reports')
          .select('id,name,age,gender,photo,clothing,last_seen_location,last_seen_time,category,status,notes,user_id,created_at,updated_at,authority_id,authority_name,authority_phone,authority_assigned_at,found_by')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('found_person_reports')
          .select('id,name,age,gender,photo,clothing,found_location,found_time,category,status,notes,user_id,created_at,updated_at')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const { data: lostData, error: lostError } = lostRes;
      const { data: foundData, error: foundError } = foundRes;

      if (lostError) throw lostError;
      if (foundError) throw foundError;

      // Fetch reporter profiles efficiently for cards (name/phone)
      const allUserIds = [...new Set([
        ...(lostData?.map(r => r.user_id) || []),
        ...(foundData?.map(r => r.user_id) || [])
      ])];

      let profilesMap: Map<string, any> = new Map();
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .in('id', allUserIds);
        (profiles || []).forEach(p => profilesMap.set(p.id, p));
      }

      const transformedLostReports = lostData?.map(report => {
        const transformedReport = {
          id: report.id,
          name: report.name,
          age: report.age,
          gender: report.gender as 'male' | 'female' | 'other',
          photo: report.photo,
          clothing: report.clothing,
          lastSeenLocation: report.last_seen_location,
          lastSeenTime: new Date(report.last_seen_time),
          category: report.category as 'child' | 'elderly' | 'disabled' | 'adult' | undefined,
          status: (report.status || 'pending') as LostPersonReport['status'],
          notes: report.notes,
          reporterId: report.user_id,
          createdAt: new Date(report.created_at),
          updatedAt: new Date(report.updated_at),
          authorityId: report.authority_id,
          authorityName: report.authority_name,
          authorityPhone: report.authority_phone,
          authorityAssignedAt: report.authority_assigned_at ? new Date(report.authority_assigned_at) : undefined,
          foundBy: report.found_by || null,
          reporterName: profilesMap.get(report.user_id)?.full_name || 'Reporter',
          reporterPhone: profilesMap.get(report.user_id)?.phone_number
        };
        
        return transformedReport;
      }) || [];
      
      console.log(`✅ Successfully transformed ${transformedLostReports.length} lost reports`);
      setLostReports(transformedLostReports);

      const transformedFoundReports = foundData?.map(report => {
        const transformedReport = {
          id: report.id,
          name: report.name || 'Unknown Person',
          age: report.age,
          gender: report.gender as 'male' | 'female' | 'other' | undefined,
          photo: report.photo,
          clothing: report.clothing,
          foundLocation: report.found_location,
          foundTime: new Date(report.found_time),
          category: report.category as 'child' | 'elderly' | 'disabled' | 'adult' | undefined,
          status: report.status as FoundPersonReport['status'],
          notes: report.notes,
          foundById: report.user_id,
          createdAt: new Date(report.created_at),
          updatedAt: new Date(report.updated_at),
          reporterName: profilesMap.get(report.user_id)?.full_name,
          reporterPhone: profilesMap.get(report.user_id)?.phone_number
        };
        
        return transformedReport;
      }) || [];
      
      console.log(`✅ Successfully transformed ${transformedFoundReports.length} found reports`);
      setFoundReports(transformedFoundReports);

      console.log('🎉 Report loading completed successfully!');

    } catch (error) {
      console.error('💥 Critical error loading reports:', error);
      toast({
        title: getLocalizedText(
          "Error loading reports",
          "रिपोर्ट लोड करने में त्रुटि",
          "अहवाल लोड करताना त्रुटी"
        ),
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };
  
  const handleViewLostDetails = (report: LostPersonReport) => {
    setSelectedLostReport(report);
    setSelectedFoundReport(null);
    setIsDetailsOpen(true);
  };
  
  const handleViewFoundDetails = (report: FoundPersonReport) => {
    setSelectedFoundReport(report);
    setSelectedLostReport(null);
    setIsDetailsOpen(true);
  };

  const handleEditReport = (report: LostPersonReport) => {
    setSelectedLostReport(report);
    setIsUpdateFormOpen(true);
  };
  
  const handleStatusChange = async (reportId: string, newStatus: LostPersonReport['status'] | FoundPersonReport['status'], type: 'lost' | 'found') => {
    try {
      if (type === 'lost') {
        const { data: { user } } = await supabase.auth.getUser();
        const updateData: any = { 
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (newStatus === 'found' && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_number')
            .eq('id', user.id)
            .single();

          updateData.authority_id = user.id;
          updateData.authority_name = profile?.full_name || 'Unknown Authority';
          updateData.authority_phone = profile?.phone_number;
          updateData.authority_assigned_at = new Date().toISOString();
          updateData.found_by = user.id;
        }

        const { error } = await supabase
          .from('lost_person_reports')
          .update(updateData)
          .eq('id', reportId);

        if (error) throw error;

        setLostReports(prev => prev.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                status: newStatus as LostPersonReport['status'], 
                updatedAt: new Date(),
                ...(newStatus === 'found' && user ? {
                  authorityId: user.id,
                  authorityName: updateData.authority_name,
                  authorityPhone: updateData.authority_phone,
                  authorityAssignedAt: new Date(),
                  foundBy: user.id
                } : {})
              }
            : report
        ));
        
        if (selectedLostReport?.id === reportId) {
          setSelectedLostReport({ 
            ...selectedLostReport, 
            status: newStatus as LostPersonReport['status'],
            ...(newStatus === 'found' && user ? {
              authorityId: user.id,
              authorityName: updateData.authority_name,
              authorityPhone: updateData.authority_phone,
              authorityAssignedAt: new Date(),
              foundBy: user.id
            } : {})
          });
        }
      } else {
        const { error } = await supabase
          .from('found_person_reports')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId);

        if (error) throw error;

        setFoundReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus as FoundPersonReport['status'], updatedAt: new Date() }
            : report
        ));
        
        if (selectedFoundReport?.id === reportId) {
          setSelectedFoundReport({ ...selectedFoundReport, status: newStatus as FoundPersonReport['status'] });
        }
      }

      toast({
        title: getLocalizedText(
          "Status Updated",
          "स्थिति अपडेट की गई",
          "स्थिति अपडेट केली"
        ),
        description: getLocalizedText(
          `Report status updated to ${newStatus}`,
          `रिपोर्ट स्थिति ${newStatus} पर अपडेट की गई`,
          `अहवाल स्थिती ${newStatus} वर अपडेट केली`
        ),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: getLocalizedText(
          "Error updating status",
          "स्थिति अपडेट करने में त्रुटि",
          "स्थिति अपडेट करताना त्रुटी"
        ),
        variant: "destructive",
      });
    }
  };
  
  const filteredLostReports = selectedStatus === 'all' 
    ? lostReports 
    : lostReports.filter(report => report.status === selectedStatus);
    
  const filteredFoundReports = selectedStatus === 'all' 
    ? foundReports.filter(report => report.status !== 'under_review')
    : foundReports.filter(report => report.status === selectedStatus && report.status !== 'under_review');

  const handleUpdateFormClose = () => {
    setIsUpdateFormOpen(false);
    loadReports();
  };

  return {
    lostReports,
    foundReports,
    selectedLostReport,
    selectedFoundReport,
    isDetailsOpen,
    selectedStatus,
    isUpdateFormOpen,
    filteredLostReports,
    filteredFoundReports,
    loading,
    formatDate,
    handleViewLostDetails,
    handleViewFoundDetails,
    handleEditReport,
    handleStatusChange,
    setSelectedStatus,
    setIsDetailsOpen,
    handleUpdateFormClose,
    loadReports
  };
};
