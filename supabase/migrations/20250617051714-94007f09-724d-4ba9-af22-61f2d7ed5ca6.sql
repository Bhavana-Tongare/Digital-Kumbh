
-- Add authority information columns to lost_person_reports table
ALTER TABLE public.lost_person_reports 
ADD COLUMN authority_id uuid REFERENCES auth.users(id),
ADD COLUMN authority_name text,
ADD COLUMN authority_phone text,
ADD COLUMN authority_assigned_at timestamp with time zone;

-- Create an index for better performance when querying by authority
CREATE INDEX idx_lost_person_reports_authority_id ON public.lost_person_reports(authority_id);

-- Update RLS policies to allow authorities to update reports assigned to them
CREATE POLICY "Authorities can update assigned reports" 
  ON public.lost_person_reports 
  FOR UPDATE 
  USING (authority_id = auth.uid());

-- Create a simple chat messages table for authority-user communication
CREATE TABLE public.report_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.lost_person_reports(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS on chat messages
ALTER TABLE public.report_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view chat messages for their reports
CREATE POLICY "Users can view chat messages for their reports" 
  ON public.report_chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.lost_person_reports 
      WHERE id = report_id 
      AND (user_id = auth.uid() OR authority_id = auth.uid())
    )
  );

-- Allow users and authorities to send messages
CREATE POLICY "Users and authorities can send messages" 
  ON public.report_chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.lost_person_reports 
      WHERE id = report_id 
      AND (user_id = auth.uid() OR authority_id = auth.uid())
    )
  );

-- Allow users to update read status
CREATE POLICY "Users can update read status" 
  ON public.report_chat_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.lost_person_reports 
      WHERE id = report_id 
      AND (user_id = auth.uid() OR authority_id = auth.uid())
    )
  );
