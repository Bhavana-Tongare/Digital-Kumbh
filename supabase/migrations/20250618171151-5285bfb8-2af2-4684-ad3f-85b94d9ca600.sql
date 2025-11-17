
-- Update RLS policies for lost_person_reports to allow broader access

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own reports" ON public.lost_person_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.lost_person_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.lost_person_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.lost_person_reports;
DROP POLICY IF EXISTS "Authorities can update assigned reports" ON public.lost_person_reports;

-- Create new policies that allow broader access
-- Allow all authenticated users to view all lost person reports
CREATE POLICY "All authenticated users can view lost person reports" 
  ON public.lost_person_reports 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow users to create reports (but they will be visible to everyone)
CREATE POLICY "Authenticated users can create lost person reports" 
  ON public.lost_person_reports 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Allow report creators and authorities to update reports
CREATE POLICY "Report creators and authorities can update reports" 
  ON public.lost_person_reports 
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (user_id = auth.uid() OR authority_id = auth.uid())
  );

-- Allow only report creators to delete their reports
CREATE POLICY "Report creators can delete their own reports" 
  ON public.lost_person_reports 
  FOR DELETE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Also update found_person_reports for consistency
-- Drop existing restrictive policies for found reports
DROP POLICY IF EXISTS "Users can view their own found reports" ON public.found_person_reports;
DROP POLICY IF EXISTS "Users can create their own found reports" ON public.found_person_reports;
DROP POLICY IF EXISTS "Users can update their own found reports" ON public.found_person_reports;
DROP POLICY IF EXISTS "Users can delete their own found reports" ON public.found_person_reports;

-- Create new policies for found person reports
CREATE POLICY "All authenticated users can view found person reports" 
  ON public.found_person_reports 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create found person reports" 
  ON public.found_person_reports 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Found report creators can update their reports" 
  ON public.found_person_reports 
  FOR UPDATE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Found report creators can delete their reports" 
  ON public.found_person_reports 
  FOR DELETE 
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());
