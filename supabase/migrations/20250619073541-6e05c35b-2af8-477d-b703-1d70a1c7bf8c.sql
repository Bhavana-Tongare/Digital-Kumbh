

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authorities can view all profiles" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow authorities and admins to view all profiles for report coordination
CREATE POLICY "Authorities can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() IN ('authority', 'admin'));

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authorities and admins to update profiles if needed
CREATE POLICY "Authorities can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_current_user_role() IN ('authority', 'admin'));

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

