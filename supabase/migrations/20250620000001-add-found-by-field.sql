
-- Add foundBy field to lost_person_reports table
ALTER TABLE public.lost_person_reports 
ADD COLUMN found_by UUID REFERENCES auth.users(id);

-- Create an index on the found_by column for better query performance
CREATE INDEX idx_lost_person_reports_found_by ON public.lost_person_reports(found_by);

-- Update RLS policies to allow authorities to view profile information
-- This policy allows authorities and admins to read all profiles
CREATE POLICY "Authorities can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('authority', 'admin')
    )
  );
