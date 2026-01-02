-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true);

-- RLS policies for resumes bucket (private - only admins can access)
CREATE POLICY "Admins can view resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admins can delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- RLS policies for team-photos bucket (public read, admin write)
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can upload team photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'));