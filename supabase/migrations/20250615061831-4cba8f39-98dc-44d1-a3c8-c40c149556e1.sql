
-- Create the found_person_reports table
CREATE TABLE public.found_person_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  age INTEGER,
  gender TEXT,
  photo TEXT,
  clothing TEXT,
  found_location TEXT NOT NULL,
  found_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  matched_with_report_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for found_person_reports
ALTER TABLE public.found_person_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for found_person_reports
CREATE POLICY "Users can view all found person reports" 
  ON public.found_person_reports 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own found person reports" 
  ON public.found_person_reports 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own found person reports" 
  ON public.found_person_reports 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authorities can update all found person reports" 
  ON public.found_person_reports 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('authority', 'admin')
    )
  );
