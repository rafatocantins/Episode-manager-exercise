import React from 'react';

// mock data - to replace with actual data fetching/props
const mockAnalyticsData = {
    averageRating: 4.2,
    ratingDistribution: [
        { stars: 1, count: 15 },
        { stars: 2, count: 30 },
        { stars: 3, count: 150 },
        { stars: 4, count: 450 },
        { stars: 5, count: 355 },
    ],
    completionRate: 78, // Percentage
    dropOffPoints: [ // Timestamps in seconds
        { timestamp: 300, dropOffs: 50 },
        { timestamp: 900, dropOffs: 80 },
        { timestamp: 1800, dropOffs: 120 },
    ],
    reactionTags: [
        { tag: 'Exciting', count: 500 },
        { tag: 'Funny', count: 350 },
        { tag: 'Suspenseful', count: 200 },
        { tag: 'Boring', count: 50 },
        { tag: 'Scary', count: 80 },
    ],
    totalViews: 15000,
    uniqueViewers: 9500,
};

// Helper to format timestamp (seconds to MM:SS)
const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Basic Bar Chart Component (Themed)
interface BarChartProps {
    data: { label: string | number; value: number }[];
    title: string;
    barColor?: string;
    heightClass?: string; // e.g., 'h-40'
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, title, barColor = 'bg-gray-500', heightClass = 'h-40' }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);

    return (
        <div className="mt-4"> {/* Removed outer container styling, handled by parent component */}
            {title && <h4 className="text-md font-semibold mb-3 text-gray-300">{title}</h4>}
            <div className={`flex items-end space-x-2 ${heightClass} w-full`}>
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div
                            className={`w-full ${barColor} transition-all duration-300 ease-in-out rounded-t`}
                            style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            title={`Value: ${item.value}`}
                        ></div>
                        <span className="text-xs mt-1 text-gray-400 truncate w-full text-center">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const EpisodeAnalytics: React.FC = () => {
    // In a real app, we'd fetch this data or receive it via props
    const analytics = mockAnalyticsData;

    const ratingChartData = analytics.ratingDistribution.map(r => ({ label: `${r.stars}★`, value: r.count }));
    const reactionChartData = analytics.reactionTags.sort((a, b) => b.count - a.count).slice(0, 5).map(t => ({ label: t.tag, value: t.count }));

    return (
        // Use darker background, adjust padding/margins
        <div className="bg-gray-800 rounded-lg shadow-lg mt-6">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-100">Episode Analytics</h2>

            {/* Filters Placeholder - Themed */}
            <div className="mb-6 p-4 border border-gray-600 rounded bg-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Filters</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Themed select dropdowns */}
                    <select className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600 flex-grow">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>All Time</option>
                    </select>
                    <select className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600 flex-grow">
                        <option>All Viewers</option>
                        <option>Subscribers</option>
                        <option>New Viewers</option>
                    </select>
                </div>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Card Styling: Darker background, lighter text, subtle borders */}
                {/* 1. Episode Ratings */}
                <div className="p-4 border border-gray-700 rounded shadow-md bg-gray-750"> {/* Slightly different bg for cards */}
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Average Rating</h3>
                    <p className="text-3xl font-bold text-yellow-400">{analytics.averageRating.toFixed(1)} <span className="text-lg text-gray-400">/ 5</span></p>
                    {/* Use themed chart */}
                    <SimpleBarChart data={ratingChartData} title="Rating Distribution" barColor="bg-yellow-500" heightClass="h-32" />
                </div>

                {/* 2. Completion Rate */}
                <div className="p-4 border border-gray-700 rounded shadow-md bg-gray-750">
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Completion Rate</h3>
                    <p className="text-3xl font-bold text-green-500">{analytics.completionRate}%</p>
                    <p className="text-sm text-gray-400 mt-1">Percentage of viewers who watched the full episode.</p>
                     {/* Themed progress bar */}
                     <div className="w-full bg-gray-600 rounded-full h-2.5 mt-4">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${analytics.completionRate}%` }}></div>
                    </div>
                </div>

                 {/* 5. Total Views & Unique Viewers (Combined) */}
                 <div className="p-4 border border-gray-700 rounded shadow-md bg-gray-750">
                    <h3 className="text-lg font-semibold mb-2 text-gray-200">Viewership</h3>
                    <div className="flex flex-col sm:flex-row justify-around gap-4 mt-2">
                        <div className="text-center">
                            <p className="text-sm text-gray-400">Total Views</p>
                            <p className="text-2xl font-bold text-blue-400">{analytics.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">Unique Viewers</p>
                            <p className="text-2xl font-bold text-purple-400">{analytics.uniqueViewers.toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-3 text-center">Indicates overall popularity and reach.</p>
                </div>


                {/* 4. User Reaction Tags */}
                 <div className="p-4 border border-gray-700 rounded shadow-md bg-gray-750">
                     <h3 className="text-lg font-semibold mb-2 text-gray-200">Top User Reactions</h3>
                     {/* Use themed chart */}
                     <SimpleBarChart data={reactionChartData} title="" barColor="bg-indigo-400" heightClass="h-32"/>
                     <p className="text-sm text-gray-400 mt-3">Common qualitative feedback tags.</p>
                 </div>


                {/* 3. Viewer Drop-off Points */}
                {/* Make this span full width on large screens too */}
                <div className="p-4 border border-gray-700 rounded shadow-md bg-gray-750 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Viewer Drop-off Points</h3>
                    <p className="text-sm text-gray-400 mb-3">Timestamps where viewers frequently stopped watching.</p>
                    {analytics.dropOffPoints.length > 0 ? (
                        <ul className="space-y-2">
                            {analytics.dropOffPoints.sort((a, b) => b.dropOffs - a.dropOffs).map((point, index) => (
                                // Use primary color for emphasis
                                <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm p-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 transition-colors">
                                    <span className="font-mono text-red-400">Timestamp: {formatTimestamp(point.timestamp)}</span>
                                    <span className="font-medium text-gray-300 mt-1 sm:mt-0">{point.dropOffs.toLocaleString()} Drop-offs</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">No significant drop-off points identified.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EpisodeAnalytics;