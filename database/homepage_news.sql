CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  title_ja VARCHAR(255) NOT NULL,
  link_type VARCHAR(20) NOT NULL DEFAULT 'none',
  link_value VARCHAR(500) NULL,
  news_date DATE NOT NULL,
  image VARCHAR(500) NULL,
  show_in_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_news_date (news_date),
  INDEX idx_show_in_featured (show_in_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
