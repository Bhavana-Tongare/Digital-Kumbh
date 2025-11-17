-- Create table to store which report is displayed on which screen
CREATE TABLE IF NOT EXISTS public.screen_displays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  screen_id text NOT NULL UNIQUE,
  screen_name text NOT NULL,
  report_id uuid REFERENCES public.lost_person_reports(id) ON DELETE CASCADE,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.screen_displays ENABLE ROW LEVEL SECURITY;

-- Allow authorities to view all screen displays
CREATE POLICY "Authorities can view screen displays"
ON public.screen_displays
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('authority', 'admin')
  )
);

-- Allow authorities to insert screen displays
CREATE POLICY "Authorities can insert screen displays"
ON public.screen_displays
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('authority', 'admin')
  )
);

-- Allow authorities to update screen displays
CREATE POLICY "Authorities can update screen displays"
ON public.screen_displays
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('authority', 'admin')
  )
);

-- Allow anyone to view screen displays (for the display screens)
CREATE POLICY "Anyone can view screen displays"
ON public.screen_displays
FOR SELECT
USING (true);

-- Enable realtime for screen_displays
ALTER TABLE public.screen_displays REPLICA IDENTITY FULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_screen_displays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER screen_displays_updated_at
BEFORE UPDATE ON public.screen_displays
FOR EACH ROW
EXECUTE FUNCTION update_screen_displays_updated_at();