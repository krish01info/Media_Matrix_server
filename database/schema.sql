-- ============================================================
-- Media Matrix — Complete MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS media_matrix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE media_matrix;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_uuid (uuid),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  icon_url VARCHAR(500) DEFAULT NULL,
  gradient_start VARCHAR(7) DEFAULT NULL,
  gradient_end VARCHAR(7) DEFAULT NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug),
  INDEX idx_categories_order (display_order)
) ENGINE=InnoDB;

-- ============================================================
-- 3. sources
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50) DEFAULT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url VARCHAR(500) DEFAULT NULL,
  website_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  trust_score DECIMAL(5,2) DEFAULT 0.00,
  has_radio TINYINT(1) DEFAULT 0,
  has_newspaper TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sources_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- 4. reporters
-- ============================================================
CREATE TABLE IF NOT EXISTS reporters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  truth_score DECIMAL(5,2) DEFAULT 0.00,
  is_verified TINYINT(1) DEFAULT 0,
  is_independent TINYINT(1) DEFAULT 0,
  source_id INT DEFAULT NULL,
  total_articles INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reporters_slug (slug),
  INDEX idx_reporters_independent (is_independent),
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 5. regions
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT DEFAULT NULL,
  latitude DECIMAL(10,7) DEFAULT NULL,
  longitude DECIMAL(10,7) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_regions_slug (slug),
  FOREIGN KEY (parent_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 6. tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tags_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- 7. articles
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500) DEFAULT NULL,
  slug VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  summary TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  category_id INT NOT NULL,
  source_id INT NOT NULL,
  reporter_id INT DEFAULT NULL,
  truth_score DECIMAL(5,2) DEFAULT 0.00,
  is_verified TINYINT(1) DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  is_breaking TINYINT(1) DEFAULT 0,
  is_developing TINYINT(1) DEFAULT 0,
  is_live TINYINT(1) DEFAULT 0,
  is_morning_brief TINYINT(1) DEFAULT 0,
  interaction_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  share_count BIGINT DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_articles_uuid (uuid),
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_category (category_id),
  INDEX idx_articles_source (source_id),
  INDEX idx_articles_reporter (reporter_id),
  INDEX idx_articles_featured (is_featured),
  INDEX idx_articles_breaking (is_breaking),
  INDEX idx_articles_developing (is_developing),
  INDEX idx_articles_morning_brief (is_morning_brief),
  INDEX idx_articles_published (published_at),
  INDEX idx_articles_interactions (interaction_count DESC),
  FULLTEXT INDEX ft_articles_search (title, content, summary),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE RESTRICT,
  FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 8. article_tags (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. article_regions (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_regions (
  article_id INT NOT NULL,
  region_id INT NOT NULL,
  PRIMARY KEY (article_id, region_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. newspapers
-- ============================================================
CREATE TABLE IF NOT EXISTS newspapers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  pdf_url VARCHAR(500) DEFAULT NULL,
  edition_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_newspapers_date (edition_date),
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. radio_streams
-- ============================================================
CREATE TABLE IF NOT EXISTS radio_streams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT DEFAULT NULL,
  stream_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  is_live TINYINT(1) DEFAULT 0,
  is_high_quality TINYINT(1) DEFAULT 0,
  listener_count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_radio_live (is_live),
  INDEX idx_radio_order (display_order),
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. podcasts
-- ============================================================
CREATE TABLE IF NOT EXISTS podcasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT DEFAULT NULL,
  audio_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  duration_seconds INT DEFAULT NULL,
  episode_number INT DEFAULT NULL,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_podcasts_published (published_at),
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. trending_topics
-- ============================================================
CREATE TABLE IF NOT EXISTS trending_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  engagement_score BIGINT DEFAULT 0,
  engagement_label VARCHAR(100) DEFAULT NULL,
  region_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  trended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trending_active (is_active),
  INDEX idx_trending_score (engagement_score DESC),
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 14. trending_topic_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS trending_topic_articles (
  topic_id INT NOT NULL,
  article_id INT NOT NULL,
  PRIMARY KEY (topic_id, article_id),
  FOREIGN KEY (topic_id) REFERENCES trending_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 15. regional_charts
-- ============================================================
CREATE TABLE IF NOT EXISTS regional_charts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `rank` INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  metric_label VARCHAR(200) DEFAULT NULL,
  region_id INT NOT NULL,
  article_id INT DEFAULT NULL,
  chart_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_charts_region_date (region_id, chart_date),
  INDEX idx_charts_rank (chart_date, `rank`),
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 16. world_map_insights
-- ============================================================
CREATE TABLE IF NOT EXISTS world_map_insights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT DEFAULT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  icon_type VARCHAR(50) DEFAULT NULL,
  article_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_map_active (is_active),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 17. user_bookmarks
-- ============================================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_bookmark (user_id, article_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 18. user_reading_history
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reading_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_duration_sec INT DEFAULT NULL,
  INDEX idx_history_user (user_id),
  INDEX idx_history_read (read_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 19. user_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferred_categories JSON DEFAULT NULL,
  preferred_regions JSON DEFAULT NULL,
  preferred_sources JSON DEFAULT NULL,
  notification_enabled TINYINT(1) DEFAULT 1,
  high_quality_audio TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 20. refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_refresh_token (token),
  INDEX idx_refresh_user (user_id),
  INDEX idx_refresh_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 21. compare_coverages
-- ============================================================
CREATE TABLE IF NOT EXISTS compare_coverages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_title VARCHAR(300) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_compare_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- 22. compare_coverage_items
-- ============================================================
CREATE TABLE IF NOT EXISTS compare_coverage_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compare_id INT NOT NULL,
  source_id INT NOT NULL,
  headline VARCHAR(500) NOT NULL,
  stance_label VARCHAR(100) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  article_id INT DEFAULT NULL,
  FOREIGN KEY (compare_id) REFERENCES compare_coverages(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB;
