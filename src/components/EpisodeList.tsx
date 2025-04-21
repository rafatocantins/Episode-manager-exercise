import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { LIST_EPISODES, GET_SEASONS } from '../graphql/queries';
import { listEpisodes as getMockEpisodes, getSeasons as getMockSeasons } from '../utils/mockData';

interface Episode {
  id: string;
  series: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
}

interface Props {
  search: string;
  onSelect: (id: string) => void;
  series: string;
  onSeasonsLoaded: (seasons: number[]) => void;
  selectedSeason: string;
}

const EpisodeList: React.FC<Props> = ({ search, onSelect, series, onSeasonsLoaded, selectedSeason }) => {
  const [mockEpisodes, setMockEpisodes] = useState<Episode[]>([]);
  const [mockSeasons, setMockSeasons] = useState<number[]>([]);

  // Try to use GraphQL API first
  const [useMockData, setUseMockData] = useState<boolean>(false);
  // Try to use GraphQL API first
  const { data, loading, error } = useQuery(LIST_EPISODES, { 
    variables: { search, series },
    onError: () => {
      // If GraphQL fails, switch to mock data
      setUseMockData(true);
    }
  });
  
  const { data: seasonsData, loading: seasonsLoading, error: seasonsError } = useQuery(GET_SEASONS, {
    variables: { series },
    onCompleted: (data) => {
      if (data && data.getSeasons) {
        const seasons = data.getSeasons.map((s: any) => s.seasonNumber);
        onSeasonsLoaded(seasons);
      }
    },
    onError: () => {
      // If GraphQL fails, switch to mock data
      setUseMockData(true);
    }
  });

  // Prepare mock data as fallback
  useEffect(() => {
    if (useMockData) {
      console.log('Using mock data as fallback');
      const episodes = getMockEpisodes(search, series);
      setMockEpisodes(episodes);
      
      const seasons = getMockSeasons(series);
      setMockSeasons(seasons);
      onSeasonsLoaded(seasons);
    }
  }, [useMockData, search, series, onSeasonsLoaded]);

  // Show loading state
  if ((loading || seasonsLoading) && !useMockData) {
    return <div className="text-gray-400">Loading episodes...</div>;
  }
  
  // If using GraphQL and there's an error, show a warning but continue with mock data
  if ((error || seasonsError) && !useMockData) {
    console.error('GraphQL Error:', error || seasonsError);
    return (
      <div className="bg-yellow-500 bg-opacity-20 text-yellow-100 p-4 rounded mb-4">
        <p className="font-bold">Warning: Using offline data</p>
        <p>Could not connect to the episode database. Using local data instead.</p>
        <p className="mt-2 text-sm">
          Error: {error?.message || seasonsError?.message || 'Unknown error'}
        </p>
        <button 
          onClick={() => setUseMockData(true)}
          className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm"
        >
          Continue with offline data
        </button>
      </div>
    );
  }
  
  // Use either real data or mock data
  let episodes: Episode[] = [];
  
  if (useMockData) {
    episodes = mockEpisodes;
  } else if (data && data.listEpisodes) {
    episodes = data.listEpisodes;
  } else {
    return <div className="text-gray-400">No episodes found. Try adjusting your search criteria.</div>;
  }

  // Filter by season if needed
  const filteredEpisodes = episodes.filter((episode: Episode) => {
    return selectedSeason === '' || episode.seasonNumber === parseInt(selectedSeason);
  });

  return (
    <ul className="space-y-2">
      {filteredEpisodes.map((ep: Episode) => (
        <li
          key={ep.id}
          onClick={() => onSelect(ep.id)}
          className="cursor-pointer hover:text-gray-400 hover:underline"
        >
          {ep.series} S{ep.seasonNumber}E{ep.episodeNumber}: {ep.title}
        </li>
      ))}
    </ul>
  );
};

export default EpisodeList;
