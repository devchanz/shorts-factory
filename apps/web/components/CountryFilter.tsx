'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const COUNTRIES = [
    { code: 'KR', label: 'South Korea' },
    { code: 'US', label: 'United States' },
    { code: 'UK', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
    { code: 'IN', label: 'India' },
];

export default function CountryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCountry = searchParams.get('country') || 'KR';

    const handleCountryChange = (code: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('country', code);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {COUNTRIES.map((country) => (
                <button
                    key={country.code}
                    onClick={() => handleCountryChange(country.code)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
            ${currentCountry === country.code
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    {country.label}
                </button>
            ))}
        </div>
    );
}
