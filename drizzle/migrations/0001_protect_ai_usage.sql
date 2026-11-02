CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_usage TO service_role;
REVOKE ALL ON public.ai_usage FROM anon, authenticated;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_usage_user_created_at_idx ON public.ai_usage (user_id, created_at);

CREATE FUNCTION public.enforce_ai_usage_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));
  IF (SELECT count(*) FROM public.ai_usage WHERE user_id = NEW.user_id AND created_at >= clock_timestamp() - interval '60 minutes') >= 20 THEN
    RAISE EXCEPTION 'ai_usage_limit_reached' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_ai_usage_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_ai_usage_limit() TO service_role;
CREATE TRIGGER ai_usage_limit_before_insert BEFORE INSERT ON public.ai_usage
FOR EACH ROW EXECUTE FUNCTION public.enforce_ai_usage_limit();