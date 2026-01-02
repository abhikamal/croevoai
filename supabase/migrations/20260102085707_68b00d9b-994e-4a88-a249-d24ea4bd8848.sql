-- Create site_content table for admin-editable home page content
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view site content
CREATE POLICY "Site content is publicly viewable"
ON public.site_content
FOR SELECT
USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
ON public.site_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default home page content
INSERT INTO public.site_content (section_key, title, subtitle, content, button_text, button_link) VALUES
('hero', 'Building Tomorrow''s Intelligence Today', 'The Future of AI is Here', 'Croevo AI is at the forefront of artificial intelligence innovation, creating solutions that transform industries and empower businesses worldwide.', 'Discover More', '/about'),
('cta', 'Ready to Shape the Future?', NULL, 'Join our team of innovators and help build the next generation of AI solutions.', 'View Open Positions', '/careers');

-- Create subscribers table for email newsletter
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage subscribers
CREATE POLICY "Admins can manage subscribers"
ON public.subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create newsletters table for admin to create newsletter content
CREATE TABLE public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Only admins can manage newsletters
CREATE POLICY "Admins can manage newsletters"
ON public.newsletters
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_newsletters_updated_at
BEFORE UPDATE ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();