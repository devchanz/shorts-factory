-- Create daily_metrics table for quota tracking
CREATE TABLE IF NOT EXISTS daily_metrics (
    date TEXT PRIMARY KEY, -- 'YYYY-MM-DD'
    quota_used INTEGER DEFAULT 0,
    updated_at INTEGER
);
