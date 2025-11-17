-- Allow anonymous inserts/selects for crowd_samples (for kiosk/authority devices)
-- NOTE: This is safe only if your anon key is protected. Restrict in production if needed.

DO $$
BEGIN
  -- Insert policy for anon
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crowd_samples' AND policyname = 'crowd_samples_insert_anon'
  ) THEN
    CREATE POLICY "crowd_samples_insert_anon"
      ON public.crowd_samples
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  -- Select policy for anon
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crowd_samples' AND policyname = 'crowd_samples_select_anon'
  ) THEN
    CREATE POLICY "crowd_samples_select_anon"
      ON public.crowd_samples
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;


