-- Guest PII may no longer be written directly from the browser.
DROP POLICY IF EXISTS "menu_guest_reg public insert" ON public.menu_guest_registrations;

DROP POLICY IF EXISTS "Anyone can insert tasting events" ON public.tasting_events;
CREATE POLICY "Anonymous tasting events without PII"
ON public.tasting_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 128
  AND event_type IS NOT NULL
  AND length(event_type) BETWEEN 1 AND 64
  AND guest_name IS NULL
  AND guest_email IS NULL
  AND guest_phone IS NULL
);

REVOKE INSERT ON public.menu_guest_registrations FROM anon, authenticated;
GRANT ALL ON public.menu_guest_registrations TO service_role;
GRANT ALL ON public.tasting_events TO service_role;