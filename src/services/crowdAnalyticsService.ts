import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export type CrowdSampleInsert = TablesInsert<'crowd_samples'>;

export async function logCrowdSample(sample: Omit<CrowdSampleInsert, 'captured_at' | 'id'>) {
  const { error } = await supabase
    .from('crowd_samples')
    .insert({
      place_id: sample.place_id,
      place_name: sample.place_name,
      count: sample.count,
      status: sample.status,
    } satisfies CrowdSampleInsert);

  if (error) throw error;
}

export async function fetchCrowdSummaryByDate() {
  // Fetch all samples (caller can filter/aggregate)
  const { data, error } = await supabase
    .from('crowd_samples')
    .select('place_id, place_name, count, status, captured_at, date, day_of_week')
    .order('captured_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}


