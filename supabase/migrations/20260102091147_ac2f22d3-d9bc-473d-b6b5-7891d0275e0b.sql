-- Create admin_invites table for invite links
CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email TEXT,
  created_by uuid NOT NULL,
  used_by uuid,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can create and view invites
CREATE POLICY "Admins can manage invites"
ON public.admin_invites
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view valid invite by token (for redemption)
CREATE POLICY "Anyone can view invite by token"
ON public.admin_invites
FOR SELECT
USING (true);