
-- Create emergency_alerts table
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  type TEXT NOT NULL,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for emergency_alerts
CREATE POLICY "Users can insert their own alerts" 
  ON public.emergency_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all alerts" 
  ON public.emergency_alerts 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can update all alerts" 
  ON public.emergency_alerts 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Enable realtime for emergency_alerts
ALTER TABLE public.emergency_alerts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;

-- Create function to generate alert_id
CREATE OR REPLACE FUNCTION generate_alert_id() 
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(alert_id FROM 5) AS INTEGER)), 0) + 1 
  INTO next_id 
  FROM public.emergency_alerts;
  
  RETURN 'SOS-' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate alert_id
CREATE OR REPLACE FUNCTION set_alert_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.alert_id IS NULL OR NEW.alert_id = '' THEN
    NEW.alert_id := generate_alert_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_alert_id
  BEFORE INSERT ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION set_alert_id();
