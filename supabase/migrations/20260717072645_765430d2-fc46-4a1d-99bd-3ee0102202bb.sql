
ALTER TABLE public.tasting_events
  ADD COLUMN IF NOT EXISTS duration_ms integer,
  ADD COLUMN IF NOT EXISTS step_index integer;

CREATE INDEX IF NOT EXISTS tasting_events_step_index_idx ON public.tasting_events (step_index);
