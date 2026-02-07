import { Bindings } from '../bindings';
import { ShortsAnalyzer } from './ShortsAnalyzer';
import { ShortsRepository } from './ShortsRepository';
import { YouTubeDataService } from './YouTubeDataService';

export class ShortsCollector {
    private youtubeService: YouTubeDataService;
    private repository: ShortsRepository;
    private readonly db: D1Database;

    constructor(private env: Bindings) {
        this.youtubeService = new YouTubeDataService(env.YOUTUBE_API_KEY || '');
        this.repository = new ShortsRepository(env.DB);
        this.db = env.DB;
    }

    async run(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const currentQuota = await this.getDailyQuotaUsage(today);
        const limit = parseInt(this.env.DAILY_QUOTA_LIMIT || '7200');

        console.log(`[ShortsCollector] Starting run. Quota used so far: ${currentQuota}/${limit}`);

        // Stop Mode (95%)
        if (currentQuota > limit * 0.95) {
            console.warn(`[ShortsCollector] Quota exceeded 95% (${currentQuota}). Stopping.`);
            return;
        }

        // Panic Mode (80%)
        let limitPerCountry = parseInt(this.env.SHORTS_PER_COUNTRY || '100');
        if (currentQuota > limit * 0.8) {
            console.warn(`[ShortsCollector] Quota exceeded 80% (${currentQuota}). Reducing limit to 50.`);
            limitPerCountry = 50;
        }

        const countries = (this.env.TARGET_COUNTRIES || 'KR,US,UK,CA,AU,IN').split(',');
        let sessionQuotaUsed = 0;

        for (const country of countries) {
            const code = country.trim();
            if (!code) continue;

            try {
                const result = await this.youtubeService.getPopularShorts(code, limitPerCountry);
                sessionQuotaUsed += result.quotaUsed;

                // Calculate scores
                for (const video of result.videos) {
                    video.viral_score = ShortsAnalyzer.calculateViralScore(video);
                }

                // Store
                if (result.videos.length > 0) {
                    await this.repository.upsertBatch(result.videos);
                }
            } catch (error) {
                console.error(`[ShortsCollector] Error collecting for ${code}:`, error);
            }
        }

        // Update quota
        await this.incrementDailyQuotaUsage(today, sessionQuotaUsed);
        console.log(`[ShortsCollector] Run complete. Session quota: ${sessionQuotaUsed}. Total: ${currentQuota + sessionQuotaUsed}`);

        // Cleanup
        await this.repository.cleanupOldData(7);
    }

    private async getDailyQuotaUsage(date: string): Promise<number> {
        try {
            const result = await this.db.prepare('SELECT quota_used FROM daily_metrics WHERE date = ?').bind(date).first<number>('quota_used');
            return result || 0;
        } catch (e) {
            console.error('[ShortsCollector] Failed to get quota usage:', e);
            return 0;
        }
    }

    private async incrementDailyQuotaUsage(date: string, used: number): Promise<void> {
        if (used === 0) return;
        try {
            await this.db.prepare(
                `INSERT INTO daily_metrics (date, quota_used, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET quota_used = quota_used + ?, updated_at = ?`
            ).bind(date, used, Date.now(), used, Date.now()).run();
        } catch (e) {
            console.error('[ShortsCollector] Failed to update quota usage:', e);
        }
    }
}
