import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EPISODE } from '../graphql/queries';
import { getEpisodeById as getMockEpisode } from '../utils/mockData';

interface Props {
  id: string | null;
}

const EpisodeDetail: React.FC<Props> = ({ id }) => {
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [mockEpisode, setMockEpisode] = useState<any>(null);
  
  const { data, loading, error } = useQuery(GET_EPISODE, {
    variables: { id },
    skip: !id || useMockData,
    onError: () => {
      // If GraphQL fails, switch to mock data
      setUseMockData(true);
    }
  });
  
  // Load mock data if needed
  useEffect(() => {
    if (useMockData && id) {
      const episode = getMockEpisode(id);
      setMockEpisode(episode);
    }
  }, [useMockData, id]);
  
  if (!id) return <div className="text-gray-400">Select an episode above to view details.</div>;
  
  if (loading && !useMockData) return <div className="text-gray-400">Loading episode details...</div>;
  
  if (error && !useMockData) {
    console.error('GraphQL Error:', error);
    return (
      <div className="bg-yellow-500 bg-opacity-20 text-yellow-100 p-4 rounded">
        <p className="font-bold">Warning: Using offline data</p>
        <p>Could not connect to the episode database. Using local data instead.</p>
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
  let episodeData;
  
  if (useMockData) {
    episodeData = mockEpisode;
  } else if (data && data.getEpisodeById) {
    episodeData = data.getEpisodeById;
  }
  
  if (!episodeData) {
    return <div className="text-gray-400">Episode not found or has been deleted.</div>;
  }
  
  const { series, title, description, releaseDate, imdbId } = episodeData;
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">
        {series}: {title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Released: {new Date(releaseDate).toLocaleDateString()}
      </p>
      <p className="mt-4">{description}</p>
      <a
        href={`https://www.imdb.com/title/${imdbId}`}
        target="_blank"
        className="text-gray-400 hover:text-primary transition-colors mt-2 block"
      >
        View on IMDb
      </a>
    </div>
  );
};

export default EpisodeDetail;