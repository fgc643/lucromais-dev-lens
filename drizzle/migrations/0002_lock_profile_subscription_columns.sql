DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, company_name) ON public.profiles TO authenticated;
GRANT INSERT (id, email, full_name, company_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE OR REPLACE FUNCTION public.protect_profile_subscription()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      IF COALESCE(NEW.subscription_active, false) IS DISTINCT FROM false
         OR NEW.subscription_expires_at IS NOT NULL
         OR COALESCE(NEW.subscription_plan, 'free') <> 'free' THEN
        RAISE EXCEPTION 'subscription_fields_protected' USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.subscription_active IS DISTINCT FROM OLD.subscription_active
       OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
       OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'subscription_fields_protected' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_subscription ON public.profiles;
CREATE TRIGGER protect_profile_subscription
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_subscription();