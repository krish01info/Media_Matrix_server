-- ============================================================
-- Media Matrix Final Complete PostgreSQL Schema
-- ============================================================

-- Note: Connect to your database before running this script
-- e.g., using: \c Media_matrix_final_1

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_email_idx UNIQUE (email),
  CONSTRAINT users_uuid_idx UNIQUE (uuid)
);

-- Optional: if you want explicit indexes (though UNIQUE already creates them)
CREATE INDEX idx_users_uuid ON users (uuid);
CREATE INDEX idx_users_email ON users (email);

-- To automatically update 'updated_at' on row modification, use a trigger:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 2. categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  gradient_start VARCHAR(7),
  gradient_end VARCHAR(7),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_order ON categories (display_order);


-- ============================================================
-- 3. sources
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50),
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  trust_score NUMERIC(5,2) DEFAULT 0.00,
  has_radio BOOLEAN DEFAULT FALSE,
  has_newspaper BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sources_slug ON sources (slug);


-- ============================================================
-- 4. reporters
-- ============================================================
CREATE TABLE IF NOT EXISTS reporters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200),
  bio TEXT,
  avatar_url VARCHAR(500),
  truth_score NUMERIC(5,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_independent BOOLEAN DEFAULT FALSE,
  source_id INT,
  total_articles INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporters_source FOREIGN KEY (source_id)
    REFERENCES sources(id)
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_reporters_slug ON reporters (slug);
CREATE INDEX idx_reporters_independent ON reporters (is_independent);


-- ============================================================
-- 5. regions
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_regions_parent FOREIGN KEY (parent_id)
    REFERENCES regions(id)
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_regions_slug ON regions (slug);


-- ============================================================
-- 6. tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tags_slug ON tags (slug);


-- ============================================================
-- 7. articles
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  slug VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  category_id INT NOT NULL,
  source_id INT NOT NULL,
  reporter_id INT,
  truth_score NUMERIC(5,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_breaking BOOLEAN DEFAULT FALSE,
  is_developing BOOLEAN DEFAULT FALSE,
  is_live BOOLEAN DEFAULT FALSE,
  is_morning_brief BOOLEAN DEFAULT FALSE,
  interaction_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  share_count BIGINT DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articles_source FOREIGN KEY (source_id)
    REFERENCES sources(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articles_reporter FOREIGN KEY (reporter_id)
    REFERENCES reporters(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_articles_uuid ON articles (uuid);
CREATE INDEX idx_articles_slug ON articles (slug);
CREATE INDEX idx_articles_category ON articles (category_id);
CREATE INDEX idx_articles_source ON articles (source_id);
CREATE INDEX idx_articles_reporter ON articles (reporter_id);
CREATE INDEX idx_articles_featured ON articles (is_featured);
CREATE INDEX idx_articles_breaking ON articles (is_breaking);
CREATE INDEX idx_articles_developing ON articles (is_developing);
CREATE INDEX idx_articles_morning_brief ON articles (is_morning_brief);
CREATE INDEX idx_articles_published ON articles (published_at);
CREATE INDEX idx_articles_interactions ON articles (interaction_count DESC);

-- Full-text search index (PostgreSQL uses GIN with tsvector)
CREATE INDEX ft_articles_search ON articles
  USING GIN (to_tsvector('english', title || ' ' || content || ' ' || COALESCE(summary, '')));


-- ============================================================
-- 8. article_tags (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT fk_article_tags_article FOREIGN KEY (article_id)
    REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tags_tag FOREIGN KEY (tag_id)
    REFERENCES tags(id) ON DELETE CASCADE
);


-- ============================================================
-- 9. article_regions (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_regions (
  article_id INT NOT NULL,
  region_id INT NOT NULL,
  PRIMARY KEY (article_id, region_id),
  CONSTRAINT fk_article_regions_article FOREIGN KEY (article_id)
    REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_regions_region FOREIGN KEY (region_id)
    REFERENCES regions(id) ON DELETE CASCADE
);

-- ============================================================
-- 10. newspapers
-- ============================================================
CREATE TABLE IF NOT EXISTS newspapers (
  id SERIAL PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  pdf_url VARCHAR(500),
  edition_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_newspapers_source FOREIGN KEY (source_id)
    REFERENCES sources(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_newspapers_date ON newspapers (edition_date);

-- ============================================================
-- 11. radio_streams
-- ============================================================
CREATE TABLE IF NOT EXISTS radio_streams (
  id SERIAL PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  stream_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  is_live BOOLEAN DEFAULT FALSE,
  is_high_quality BOOLEAN DEFAULT FALSE,
  listener_count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_radio_streams_source FOREIGN KEY (source_id)
    REFERENCES sources(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_radio_live ON radio_streams (is_live);
CREATE INDEX idx_radio_order ON radio_streams (display_order);


-- ============================================================
-- 12. podcasts
-- ============================================================
CREATE TABLE IF NOT EXISTS podcasts (
  id SERIAL PRIMARY KEY,
  source_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  audio_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration_seconds INT,
  episode_number INT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_podcasts_source FOREIGN KEY (source_id)
    REFERENCES sources(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_podcasts_published ON podcasts (published_at);


-- ============================================================
-- 13. trending_topics
-- ============================================================
CREATE TABLE IF NOT EXISTS trending_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  engagement_score BIGINT DEFAULT 0,
  engagement_label VARCHAR(100),
  region_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  trended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trending_region FOREIGN KEY (region_id)
    REFERENCES regions(id)
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_trending_active ON trending_topics (is_active);
CREATE INDEX idx_trending_score ON trending_topics (engagement_score DESC);


-- ============================================================
-- 14. trending_topic_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS trending_topic_articles (
  topic_id INT NOT NULL,
  article_id INT NOT NULL,
  PRIMARY KEY (topic_id, article_id),
  CONSTRAINT fk_trending_topic_articles_topic FOREIGN KEY (topic_id)
    REFERENCES trending_topics(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_trending_topic_articles_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 15. regional_charts
-- ============================================================
CREATE TABLE IF NOT EXISTS regional_charts (
  id SERIAL PRIMARY KEY,
  rank INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  metric_label VARCHAR(200),
  region_id INT NOT NULL,
  article_id INT,
  chart_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_charts_region FOREIGN KEY (region_id)
    REFERENCES regions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_charts_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_charts_region_date ON regional_charts (region_id, chart_date);
CREATE INDEX idx_charts_rank ON regional_charts (chart_date, rank);


-- ============================================================
-- 16. world_map_insights
-- ============================================================
CREATE TABLE IF NOT EXISTS world_map_insights (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  icon_type VARCHAR(50),
  article_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_map_insights_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_map_active ON world_map_insights (is_active);


-- ============================================================
-- 17. user_bookmarks
-- ============================================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_bookmark UNIQUE (user_id, article_id),
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE
);


-- ============================================================
-- 18. user_reading_history
-- ============================================================
CREATE TABLE IF NOT EXISTS user_reading_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_duration_sec INT,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_history_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_history_user ON user_reading_history (user_id);
CREATE INDEX idx_history_read ON user_reading_history (read_at);


-- ============================================================
-- 19. user_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferred_categories JSONB,
  preferred_regions JSONB,
  preferred_sources JSONB,
  notification_enabled BOOLEAN DEFAULT TRUE,
  high_quality_audio BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_preferences_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 20. refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_refresh_token ON refresh_tokens (token);
CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens (expires_at);


-- ============================================================
-- 21. compare_coverages
-- ============================================================
CREATE TABLE IF NOT EXISTS compare_coverages (
  id SERIAL PRIMARY KEY,
  topic_title VARCHAR(300) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_compare_active ON compare_coverages (is_active);


-- ============================================================
-- 22. compare_coverage_items
-- ============================================================
CREATE TABLE IF NOT EXISTS compare_coverage_items (
  id SERIAL PRIMARY KEY,
  compare_id INT NOT NULL,
  source_id INT NOT NULL,
  headline VARCHAR(500) NOT NULL,
  stance_label VARCHAR(100),
  image_url VARCHAR(500),
  article_id INT,
  CONSTRAINT fk_compare_items_compare FOREIGN KEY (compare_id)
    REFERENCES compare_coverages(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_compare_items_source FOREIGN KEY (source_id)
    REFERENCES sources(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_compare_items_article FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE SET NULL
);

