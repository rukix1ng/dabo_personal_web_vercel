-- Add image_en field to news_column table (international Supabase URL)
ALTER TABLE news_column
  ADD COLUMN image_en VARCHAR(500) NULL AFTER image;
