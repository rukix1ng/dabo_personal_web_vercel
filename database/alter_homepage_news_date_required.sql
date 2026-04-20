-- Make homepage news date required.
-- Run this after ensuring there are no existing rows with NULL news_date.

ALTER TABLE news
MODIFY COLUMN news_date DATE NOT NULL;
