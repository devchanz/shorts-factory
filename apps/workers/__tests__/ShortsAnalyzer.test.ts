import { describe, it, expect } from 'vitest';
import { ShortsAnalyzer } from '../src/services/ShortsAnalyzer';
import { ShortData } from '../src/types';

describe('ShortsAnalyzer', () => {
    it('should calculate viral score within range 0-100', () => {
        const short: ShortData = {
            id: 'test',
            view_count: 10000,
            like_count: 1000,
            comment_count: 100,
            published_at: new Date().toISOString(),
            title: 'Test',
            thumbnail_url: '',
            channel_id: '',
            channel_title: '',
            duration: 'PT59S',
            country_code: 'KR',
            collected_at: Date.now()
        };

        const score = ShortsAnalyzer.calculateViralScore(short);
        console.log('Score:', score);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('should apply time decay correctly', () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const shortFresh: ShortData = {
            id: 'fresh',
            view_count: 5000,
            like_count: 500,
            comment_count: 50,
            published_at: now.toISOString(),
            title: 'Test',
            thumbnail_url: '',
            channel_id: '',
            channel_title: '',
            duration: 'PT59S',
            country_code: 'KR',
            collected_at: Date.now()
        };

        const shortOld: ShortData = {
            ...shortFresh,
            id: 'old',
            published_at: weekAgo.toISOString()
        };

        const scoreFresh = ShortsAnalyzer.calculateViralScore(shortFresh);
        const scoreOld = ShortsAnalyzer.calculateViralScore(shortOld);

        expect(scoreFresh).toBeGreaterThan(scoreOld);
        // Decay for 7 days is 1/sqrt(8) ~= 0.35
        // So old score should be roughly 35% of fresh score (if stats identical)
        expect(scoreOld).toBeLessThan(scoreFresh * 0.5);
    });
});
