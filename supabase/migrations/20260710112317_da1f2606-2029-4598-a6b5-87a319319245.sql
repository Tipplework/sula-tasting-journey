DROP POLICY IF EXISTS "Anyone can insert their own consent" ON public.consent_logs;
CREATE POLICY "Anyone can insert their own consent"
  ON public.consent_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent_version IS NOT NULL AND length(consent_version) > 0
    AND privacy_version IS NOT NULL AND length(privacy_version) > 0
  );

DROP POLICY IF EXISTS "Anyone can submit a request" ON public.deletion_requests;
CREATE POLICY "Anyone can submit a request"
  ON public.deletion_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    contact IS NOT NULL AND length(contact) > 0
    AND request_type IN ('delete','access','correction','withdrawal')
  );
