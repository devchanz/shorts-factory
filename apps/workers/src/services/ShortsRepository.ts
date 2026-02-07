import { ShortData } from '../types';
import { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';

export class ShortsRepository {
    constructor(private db: D1Database) { }

    async upsertBatch(shorts: ShortData[]): Promise<void> {
        const chunk_size = 10; // Process 10 shorts at a time (20 queries) to be safe with D1 limits

        for (let i = 0; i < shorts.length; i += chunk_size) {
            const chunk = shorts.slice(i, i + chunk_size);
            const statements: D1PreparedStatement[] = [];

            for (const short of chunk) {
                // Upsert Shorts Metadata
                statements.push(
                    this.db.prepare(
                        `INSERT INTO shorts (id, title, thumbnail_url, channel_id, channel_title, published_at, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
             ON CONFLICT(id) DO UPDATE SET title=excluded.title, thumbnail_url=excluded.thumbnail_url`
                    ).bind(
                        short.id,
                        short.title,
                        short.thumbnail_url,
                        short.channel_id,
                        short.channel_title,
                        short.published_at,
                        short.duration,
                        short.collected_at
                    )
                );

                // Insert Trend Snapshot
                statements.push(
                    this.db.prepare(
                        `INSERT INTO trends (short_id, country_code, view_count, like_count, comment_count, viral_score, snapshotted_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
                    ).bind(
                        short.id,
                        short.country_code,
                        short.view_count,
                        short.like_count,
                        short.comment_count,
                        short.viral_score || 0,
                        short.collected_at
                    )
                );
            }

            try {
                if (statements.length > 0) {
                    await this.db.batch(statements);
                }
            } catch (e) {
                console.error('[ShortsRepository] Batch insert failed:', e);
                throw e;
            }
        }
    }

    async cleanupOldData(days: number = 7): Promise<void> {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        try {
            const result = await this.db.prepare('DELETE FROM trends WHERE snapshotted_at < ?').bind(cutoff).run();
            console.log(`[ShortsRepository] Cleanup: Deleted ${result.meta.changes} old trend records.`);
        } catch (e) {
            console.error('[ShortsRepository] Cleanup failed:', e);
        }
    }

    async getTrending(countryCode: string, limit: number = 50): Promise<any[]> {
        const { results } = await this.db.prepare(
            `SELECT t.viral_score, t.view_count, t.like_count, t.comment_count, 
              s.id, s.title, s.thumbnail_url, s.channel_title, s.duration, s.published_at 
       FROM trends t
       JOIN shorts s ON t.short_id = s.id
       WHERE t.country_code = ?
       ORDER BY t.viral_score DESC
       LIMIT ?`
        ).bind(countryCode, limit).all();
        return results;
    }

    async getShortById(id: string): Promise<any | null> {
        return await this.db.prepare(
            `SELECT s.*, t.viral_score, t.view_count, t.like_count, t.comment_count, t.country_code
       FROM shorts s
       LEFT JOIN trends t ON s.id = t.short_id
       WHERE s.id = ?
       ORDER BY t.snapshotted_at DESC
       LIMIT 1`
        ).bind(id).first();
    }
}
