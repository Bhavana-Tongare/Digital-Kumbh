
-- Fix the infinite recursion issue in profiles RLS policies
-- by creating a security definer function and updating the policies

-- First, create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorities can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies without recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Authorities can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = ANY (ARRAY['authority'::text, 'admin'::text]));

-- Also add the found_by column to lost_person_reports if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lost_person_reports' AND column_name='found_by') THEN
        ALTER TABLE public.lost_person_reports ADD COLUMN found_by uuid;
    END IF;
END $$;
