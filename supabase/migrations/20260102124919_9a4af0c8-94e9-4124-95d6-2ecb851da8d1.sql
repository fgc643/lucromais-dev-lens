-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION public.check_subscription_status(user_id uuid)
RETURNS TABLE (
  is_trial boolean,
  is_expired boolean,
  days_left integer,
  is_subscribed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  trial_end_date timestamp with time zone;
  current_time timestamp with time zone := now();
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, true, 0, false;
    RETURN;
  END IF;
  
  -- Calculate trial end date (7 days after creation)
  trial_end_date := profile_record.created_at + interval '7 days';
  
  -- If user has active subscription
  IF profile_record.subscription_active = true AND 
     (profile_record.subscription_expires_at IS NULL OR profile_record.subscription_expires_at > current_time) THEN
    RETURN QUERY SELECT false, false, 0, true;
    RETURN;
  END IF;
  
  -- Check if still in trial period
  IF current_time < trial_end_date THEN
    RETURN QUERY SELECT 
      true, 
      false, 
      EXTRACT(DAY FROM (trial_end_date - current_time))::integer + 1,
      false;
    RETURN;
  END IF;
  
  -- Trial expired and no subscription
  RETURN QUERY SELECT false, true, 0, false;
END;
$$;