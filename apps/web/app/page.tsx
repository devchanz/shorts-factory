
import CountryFilter from '../components/CountryFilter';
import ShortsCard from '../components/ShortsCard';

interface PageProps {
    searchParams: {
        country?: string;
    };
}

async function getTrendingShorts(country: string) {
    const res = await fetch(
        `https://shorts-factory-api.kcg7799.workers.dev/api/shorts/trending?country=${country}&limit=50`,
        { next: { revalidate: 300 } } // Revalidate every 5 minutes
    );

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    return res.json();
}

export default async function Home({ searchParams }: PageProps) {
    const country = searchParams.country || 'KR';
    const data = await getTrendingShorts(country);
    const shorts = data.results || [];

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                        Shorts Factory
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover viral YouTube Shorts trends powered by AI analysis.
                    </p>
                </header>

                <CountryFilter />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {shorts.map((short: any) => (
                        <ShortsCard key={short.id} short={short} />
                    ))}
                </div>

                {shorts.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        No trending shorts found for {country}.
                    </div>
                )}
            </div>
        </main>
    );
}
