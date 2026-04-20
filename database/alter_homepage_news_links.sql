SET @db = DATABASE();

SET @has_link_type = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'news' AND COLUMN_NAME = 'link_type'
);
SET @sql = IF(
  @has_link_type = 0,
  "ALTER TABLE news ADD COLUMN link_type VARCHAR(20) NOT NULL DEFAULT 'none' AFTER title_ja",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_link_value = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'news' AND COLUMN_NAME = 'link_value'
);
SET @sql = IF(
  @has_link_value = 0,
  "ALTER TABLE news ADD COLUMN link_value VARCHAR(500) NULL AFTER link_type",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_old_link = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'news' AND COLUMN_NAME = 'link'
);
SET @sql = IF(
  @has_old_link = 1,
  "UPDATE news SET link_type = 'external', link_value = link WHERE (link IS NOT NULL AND TRIM(link) <> '') AND (link_value IS NULL OR TRIM(link_value) = '') AND (link_type = 'none' OR link_type IS NULL)",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @has_old_link = 1,
  "ALTER TABLE news DROP COLUMN link",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
