import { YouTubeApiResponse, ShortData, YouTubeVideo } from '../types';
import { parseDuration } from '../utils/duration';

export class YouTubeDataService {
    private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

    constructor(private apiKey: string) { }

    async getPopularShorts(
        countryCode: string,
        limit: number = 50
    ): Promise<{ videos: ShortData[]; quotaUsed: number }> {
        const videos: ShortData[] = [];
        let quotaUsed = 0;
        let nextPageToken: string | undefined;
        const maxRequests = 10; // Safety cap (approx 500 videos scanned)
        let requestCount = 0;

        console.log(`[YouTubeDataService] Starting collection for ${countryCode} (Target: ${limit})`);

        while (videos.length < limit && requestCount < maxRequests) {
            const url = new URL(`${this.baseUrl}/videos`);
            url.searchParams.append('part', 'snippet,contentDetails,statistics');
            url.searchParams.append('chart', 'mostPopular');
            url.searchParams.append('regionCode', countryCode);
            url.searchParams.append('maxResults', '50');
            url.searchParams.append('key', this.apiKey);

            if (nextPageToken) {
                url.searchParams.append('pageToken', nextPageToken);
            }

            try {
                const response = await fetch(url.toString());
                quotaUsed += 7; // Approx cost: list(1) + snippet(2) + contentDetails(2) + statistics(2)
                requestCount++;

                if (!response.ok) {
                    console.error(`[YouTubeDataService] API Error: ${response.status} ${response.statusText}`);
                    const errorText = await response.text();
                    console.error(`[YouTubeDataService] Error details: ${errorText}`);
                    break; // Stop on API error
                }

                const data = (await response.json()) as YouTubeApiResponse;

                if (!data.items || data.items.length === 0) {
                    break; // No more items
                }

                const shorts = data.items
                    .filter(this.isShort)
                    .map((item) => this.mapToShortData(item, countryCode));

                videos.push(...shorts);

                nextPageToken = data.nextPageToken;
                if (!nextPageToken) break;

            } catch (error) {
                console.error('[YouTubeDataService] Network/Parse Error:', error);
                break;
            }
        }

        console.log(`[YouTubeDataService] Collected ${videos.length} shorts for ${countryCode}. Quota used: ${quotaUsed}`);

        // Trim to limit if exceeded
        return {
            videos: videos.slice(0, limit),
            quotaUsed
        };
    }

    private isShort(video: YouTubeVideo): boolean {
        const durationSec = parseDuration(video.contentDetails?.duration || '');
        // YouTube Shorts must be <= 60 seconds
        if (durationSec > 60) return false;

        // Optional: Add aspect ratio check if reliable metadata available
        // For now, duration is the strongest signal for "mostPopular" chart mixed content
        return true;
    }

    private mapToShortData(video: YouTubeVideo, countryCode: string): ShortData {
        return {
            id: video.id,
            title: video.snippet.title,
            thumbnail_url: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
            channel_id: video.snippet.channelId,
            channel_title: video.snippet.channelTitle,
            published_at: video.snippet.publishedAt,
            duration: video.contentDetails.duration,
            view_count: parseInt(video.statistics.viewCount || '0'),
            like_count: parseInt(video.statistics.likeCount || '0'),
            comment_count: parseInt(video.statistics.commentCount || '0'),
            country_code: countryCode,
            collected_at: Date.now(),
        };
    }
}
