import ThumbnailImage from './ThumbnailImage';

interface ShortData {
    id: string;
    title: string;
    thumbnail_url: string;
    channel_title: string;
    viral_score: number;
    view_count: number;
    like_count: number;
    comment_count: number;
    published_at: string;
    duration: string;
}

interface ShortsCardProps {
    short: ShortData;
}

export default function ShortsCard({ short }: ShortsCardProps) {
    const scoreColor =
        short.viral_score >= 80 ? 'text-green-500' :
            short.viral_score >= 50 ? 'text-yellow-500' : 'text-gray-400';

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="relative aspect-[9/16] w-full">
                <ThumbnailImage
                    src={short.thumbnail_url}
                    alt={short.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">
                    {short.duration.replace('PT', '').toLowerCase()}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2 h-14 leading-tight">
                    {short.title}
                </h3>

                <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm truncate max-w-[60%]">
                        {short.channel_title}
                    </span>
                    <span className={`text-xl font-bold ${scoreColor}`}>
                        {short.viral_score}
                    </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 border-t border-gray-700 pt-3">
                    <div className="flex items-center gap-1">
                        <span>👁️</span> {new Intl.NumberFormat('en-US', { notation: "compact" }).format(short.view_count)}
                    </div>
                    <div className="flex items-center gap-1">
                        <span>👍</span> {new Intl.NumberFormat('en-US', { notation: "compact" }).format(short.like_count)}
                    </div>
                    <div className="flex items-center gap-1">
                        <span>💬</span> {new Intl.NumberFormat('en-US', { notation: "compact" }).format(short.comment_count)}
                    </div>
                </div>
            </div>
        </div>
    );
}
