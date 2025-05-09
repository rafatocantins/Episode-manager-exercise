import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { LIST_EPISODES, GET_SEASONS } from '../graphql/queries';
import { listEpisodes as getMockEpisodes, getSeasons as getMockSeasons, MockEpisode } from '../utils/mockData';
import EpisodeListItem from './EpisodeListItem'; // Import the new component

// Extend Episode interface if needed (e.g., for imageUrl, averageRating from API)
interface Episode {
  id: string;
  series: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  description: string;
  releaseDate: string;
  imdbId: string;
  imageUrl?: string; // Add optional fields if they might come from API
  averageRating?: number;
}

interface Props {
  search: string;
  onSelect: (id: string, series: string) => void; // This prop remains to notify the parent
  series: string;
  onSeasonsLoaded: (seasons: number[]) => void;
  selectedSeason: string;
  selectedEpisodeId: string | null; // Receive currently selected ID from parent
}

const EpisodeList: React.FC<Props> = ({
  search,
  onSelect,
  series,
  onSeasonsLoaded,
  selectedSeason,
  selectedEpisodeId // Use the ID passed from the parent
}) => {
  const [mockSeasons, setMockSeasons] = useState<number[]>([]);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  // Add a timestamp to force refresh when mock data changes
  const [mockDataTimestamp, setMockDataTimestamp] = useState<number>(Date.now());

  // GraphQL query for episodes
  const { data, loading, error } = useQuery(LIST_EPISODES, {
    variables: { search, series },
  });

  // GraphQL query for seasons
  const { data: seasonsData, loading: seasonsLoading, error: seasonsError } = useQuery(GET_SEASONS, {
    variables: { series },
    skip: useMockData, // Skip if using mock data
    onCompleted: (data) => {
      if (data?.getSeasons) {
        const seasons = data.getSeasons.map((s: any) => s.seasonNumber).sort((a: number, b: number) => a - b);
        onSeasonsLoaded(seasons);
      } else if (!useMockData) {
         // Handle case where API returns empty/null seasons but no error
         onSeasonsLoaded([]);
      }
    },
    onError: () => {
      console.warn("GraphQL seasons query failed, switching to mock data.");
      setUseMockData(true); // Also switch if seasons fail
    }
  });

  // Listen for mock data changes and episode deletions
  useEffect(() => {
    const handleMockDataChanged = () => {
      console.log('EpisodeList: Mock data changed event received');
      setMockDataTimestamp(Date.now()); // Update timestamp to trigger a refresh
    };

    const handleEpisodeDeleted = () => {
      console.log('EpisodeList: Episode deleted event received');
      setMockDataTimestamp(Date.now()); // Update timestamp to trigger a refresh
    };

    window.addEventListener('mockDataChanged', handleMockDataChanged);
    window.addEventListener('episodeDeleted', handleEpisodeDeleted);
    
    return () => {
      window.removeEventListener('mockDataChanged', handleMockDataChanged);
      window.removeEventListener('episodeDeleted', handleEpisodeDeleted);
    };
  }, []);

  // Prepare mock data as fallback
  useEffect(() => {
    if (useMockData) {
      console.log('Using mock data for episodes and seasons.');
      const episodes = getMockEpisodes(search, series);
      // Add mock rating/image if needed for display consistency
      const episodesWithMockExtras = episodes.map((ep: MockEpisode) => ({
          ...ep,
          // Add mock data here if your mock function doesn't provide it
          // imageUrl: `https://placehold.co/100x56/png?text=S${ep.seasonNumber}E${ep.episodeNumber}`,
          averageRating: Math.random() * (5 - 3) + 3 // Random rating between 3.0 and 5.0
      }));

      const seasons = getMockSeasons(series);
      setMockSeasons(seasons);
      onSeasonsLoaded(seasons);
    }
  }, [useMockData, search, series, mockDataTimestamp]); // Add mockDataTimestamp to refresh when mock data changes

  // --- Themed Loading and Error States ---
  if ((loading || seasonsLoading) && !useMockData) {
    return (
      <div className="p-6 text-center text-gray-400 bg-gray-800 rounded-lg shadow-md border border-gray-700 animate-pulse">
        Loading episodes...
      </div>
    );
  }

  if ((error || seasonsError) && !useMockData) {
    console.error('GraphQL Error:', error || seasonsError);
    // Automatically switch to mock data on error after showing message briefly or permanently
    // For now, just show the error and button like before, but themed
     return (
       <div className="p-4 md:p-6 bg-red-900 bg-opacity-40 border border-red-700 text-red-100 rounded-lg shadow-md mb-4">
         <p className="font-bold text-lg mb-2">Connection Error</p>
         <p className="text-sm mb-3">Could not connect to the episode database. You can try using local offline data instead.</p>
         <button
           onClick={() => setUseMockData(true)}
           className="mt-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
         >
           Use Offline Data
         </button>
       </div>
     );
  }

  // Determine data source
  let episodes: Episode[] = [];
  if (useMockData) {
    episodes = getMockEpisodes(search, series);
     episodes = episodes.map((ep: MockEpisode) => ({
          ...ep,
          // Add mock data here if your mock function doesn't provide it
          // imageUrl: `https://placehold.co/100x56/png?text=S${ep.seasonNumber}E${ep.episodeNumber}`,
          averageRating: Math.random() * (5 - 3) + 3 // Random rating between 3.0 and 5.0
      }));
  } else if (data?.listEpisodes) {
    // Add mock rating/image if API doesn't provide it
     episodes = data.listEpisodes.map((ep: any) => ({
         ...ep,
         averageRating: ep.averageRating ?? (Math.random() * (5 - 3) + 3) // Use API rating or fallback mock
         // imageUrl: ep.imageUrl ?? `https://placehold.co/100x56/png?text=S${ep.seasonNumber}E${ep.episodeNumber}`
     }));
  }

  // Filter by season
  const filteredEpisodes = episodes.filter((episode: Episode) => {
    // Ensure consistent type comparison (string vs number)
    return selectedSeason === '' || episode.seasonNumber === parseInt(selectedSeason, 10);
  });

  // --- Render List ---
  return (
    // Fixed height container with vertical scroll and theme styling
    <div className="h-[calc(100vh-650px)] md:h-[calc(100vh-400px)] overflow-y-auto bg-gray-850 p-3 rounded-lg border border-gray-700 shadow-inner">
       {useMockData && (
         <div className="mb-3 p-2 text-center text-xs bg-yellow-900 bg-opacity-50 border border-yellow-700 text-yellow-300 rounded">
           Displaying Offline Data
         </div>
       )}
      {filteredEpisodes.length > 0 ? (
        <ul className="space-y-2">
          {filteredEpisodes.map((ep: Episode) => (
            <EpisodeListItem
              key={ep.id}
              id={ep.id}
              series={ep.series}
              title={ep.title}
              seasonNumber={ep.seasonNumber}
              episodeNumber={ep.episodeNumber}
              averageRating={ep.averageRating} // Pass potential rating
              onSelect={(id, series) => onSelect(id, series)} // Pass the original onSelect handler to notify parent
              isSelected={ep.id === selectedEpisodeId} // Check against ID from parent
            />
          ))}
        </ul>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No episodes found for this season or search term.
        </div>
      )}
    </div>
  );
};

export default EpisodeList;
