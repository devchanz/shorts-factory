-- Create shorts table
CREATE TABLE IF NOT EXISTS shorts (
    id TEXT PRIMARY KEY,
    title TEXT,
    thumbnail_url TEXT,
    channel_id TEXT,
    channel_title TEXT,
    published_at TEXT,
    duration TEXT,
    created_at INTEGER
);

-- Create trends table
CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id TEXT NOT NULL REFERENCES shorts(id),
    country_code TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    viral_score INTEGER DEFAULT 0,
    snapshotted_at INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trends_country_score ON trends(country_code, viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_trends_created_at_desc ON trends(snapshotted_at DESC);
