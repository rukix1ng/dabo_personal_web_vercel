-- Add image_en field to papers table (international Supabase URL)
ALTER TABLE papers
  ADD COLUMN image_en VARCHAR(500) NULL AFTER image;
