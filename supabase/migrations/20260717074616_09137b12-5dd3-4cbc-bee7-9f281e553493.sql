DROP POLICY IF EXISTS "Anyone can insert tasting events" ON public.tasting_events;

CREATE POLICY "Anyone can insert tasting events"
  ON public.tasting_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND length(session_id) BETWEEN 8 AND 128
    AND event_type IS NOT NULL
    AND length(event_type) BETWEEN 1 AND 64
  );