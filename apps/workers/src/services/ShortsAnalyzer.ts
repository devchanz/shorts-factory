import { ShortData } from '../types';

export class ShortsAnalyzer {
    private static readonly WEIGHTS = {
        VIEWS: 0.3,
        LIKES: 0.5,
        COMMENTS: 0.2,
    };

    /**
     * Calculates viral score based on engagement metrics and time decay.
     * Score range: 0 ~ 100
     */
    static calculateViralScore(short: ShortData): number {
        const { view_count, like_count, comment_count } = short;

        // Normalization: log10(val + 1) to handle large variance
        const normViews = Math.log10(view_count + 1);
        const normLikes = Math.log10(like_count + 1);
        const normComments = Math.log10(comment_count + 1);

        // Initial Score
        let score =
            normViews * this.WEIGHTS.VIEWS +
            normLikes * this.WEIGHTS.LIKES +
            normComments * this.WEIGHTS.COMMENTS;

        // Time Decay
        const decay = this.calculateTimeDecay(short.published_at);
        score *= decay;

        // Scale to 0-100
        // Assumptions: A strict viral hit might have:
        // Views: 10M (7.0), Likes: 1M (6.0), Comments: 10k (4.0)
        // Score = 7*0.3 + 6*0.5 + 4*0.2 = 2.1 + 3.0 + 0.8 = 5.9
        // Max theoretical (100M views, 10M likes, 100k comments) -> 8*0.3 + 7*0.5 + 5*0.2 = 2.4 + 3.5 + 1.0 = 6.9
        // Let's use 7.0 as the denominator for 100 points.

        const MAX_SCORE = 7.0;
        const finalScore = (score / MAX_SCORE) * 100;

        return Math.min(Math.round(finalScore), 100);
    }

    private static calculateTimeDecay(publishedAt: string): number {
        const published = new Date(publishedAt).getTime();
        const now = Date.now();
        // Ensure diffDays is non-negative
        const diffDays = Math.max(0, (now - published) / (1000 * 60 * 60 * 24));

        // Decay factor: 1 / sqrt(days + 1)
        // Day 0: 1.0
        // Day 3: 0.5
        // Day 7: 0.35
        return 1 / Math.sqrt(diffDays + 1);
    }
}
