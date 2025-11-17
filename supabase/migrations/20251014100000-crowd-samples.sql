-- Create table to store periodic crowd counts by place and time
CREATE TABLE IF NOT EXISTS public.crowd_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL, -- e.g., 'temple', 'food-court'
  place_name TEXT NOT NULL, -- localized or English display name
  count INTEGER NOT NULL CHECK (count >= 0),
  status TEXT NOT NULL CHECK (status IN ('Green','Yellow','Red')),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE GENERATED ALWAYS AS (date_trunc('day', captured_at)::date) STORED,
  day_of_week TEXT GENERATED ALWAYS AS (to_char(captured_at, 'Day')) STORED
);

-- Enable RLS
ALTER TABLE public.crowd_samples ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to insert and select
CREATE POLICY "crowd_samples_insert_auth"
  ON public.crowd_samples
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "crowd_samples_select_auth"
  ON public.crowd_samples
  FOR SELECT
  TO authenticated
  USING (true);

-- Realtime support
ALTER TABLE public.crowd_samples REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_samples;

