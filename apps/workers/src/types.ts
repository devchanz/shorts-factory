export interface YouTubeVideoSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
        standard?: { url: string; width: number; height: number };
        maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage?: string;
    localized?: {
        title: string;
        description: string;
    };
    defaultAudioLanguage?: string;
}

export interface YouTubeVideoContentDetails {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction?: {
        allowed?: string[];
        blocked?: string[];
    };
    contentRating?: any;
    projection: string;
}

export interface YouTubeVideoStatistics {
    viewCount: string;
    likeCount: string;
    dislikeCount?: string;
    favoriteCount: string;
    commentCount: string;
}

export interface YouTubeVideo {
    kind: "youtube#video";
    etag: string;
    id: string;
    snippet: YouTubeVideoSnippet;
    contentDetails: YouTubeVideoContentDetails;
    statistics: YouTubeVideoStatistics;
}

export interface YouTubeApiResponse {
    kind: "youtube#videoListResponse";
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeVideo[];
}

export interface ShortData {
    id: string;
    title: string;
    thumbnail_url: string;
    channel_id: string;
    channel_title: string;
    published_at: string;
    duration: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    country_code: string;
    collected_at: number;
    viral_score?: number;
}
