
CREATE TABLE public.tasting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  guest_name text,
  guest_email text,
  guest_phone text,
  flight_id text,
  wine_id integer,
  wine_name text,
  event_type text NOT NULL,
  rating integer,
  quiz_answer jsonb,
  personality text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasting_events_created_at_idx ON public.tasting_events (created_at DESC);
CREATE INDEX tasting_events_session_id_idx ON public.tasting_events (session_id);
CREATE INDEX tasting_events_wine_id_idx ON public.tasting_events (wine_id);
CREATE INDEX tasting_events_event_type_idx ON public.tasting_events (event_type);

GRANT INSERT ON public.tasting_events TO anon, authenticated;
GRANT SELECT ON public.tasting_events TO authenticated;
GRANT ALL ON public.tasting_events TO service_role;

ALTER TABLE public.tasting_events ENABLE ROW LEVEL SECURITY;

-- Anyone (guest or logged in) can insert their own tasting events during the journey.
CREATE POLICY "Anyone can insert tasting events"
  ON public.tasting_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read tasting events.
CREATE POLICY "Admins can read tasting events"
  ON public.tasting_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete (for privacy requests / cleanup).
CREATE POLICY "Admins can delete tasting events"
  ON public.tasting_events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
