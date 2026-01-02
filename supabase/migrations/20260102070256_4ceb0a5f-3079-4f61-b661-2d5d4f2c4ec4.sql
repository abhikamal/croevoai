-- Fix search_path for generate_verification_id function
CREATE OR REPLACE FUNCTION public.generate_verification_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(verification_id FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.memos
  WHERE verification_id LIKE 'CRVO-' || year_part || '-%';
  
  new_id := 'CRVO-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  NEW.verification_id := new_id;
  RETURN NEW;
END;
$$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;