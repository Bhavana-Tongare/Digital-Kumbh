-- Create table to store screen status and heartbeat
CREATE TABLE IF NOT EXISTS public.screen_status (
  id TEXT PRIMARY KEY, -- screen-1, screen-2, etc.
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('online', 'offline')) DEFAULT 'offline'
);

-- Enable RLS
ALTER TABLE public.screen_status ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to insert and update, allow all to select
CREATE POLICY "screen_status_insert_auth"
  ON public.screen_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "screen_status_update_auth"
  ON public.screen_status
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "screen_status_select_auth"
  ON public.screen_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Realtime support
ALTER TABLE public.screen_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.screen_status;




