import React, { useState, useEffect } from 'react';
import { popularEpisodes, popularShows, fetchEpisodeData, OmdbShowData } from '../utils/omdbApi';

interface PopularEpisodesProps {
  onSelect?: (episodeData: OmdbShowData) => void;
}

const PopularEpisodes: React.FC<PopularEpisodesProps> = ({ onSelect }) => {
  const [episodes, setEpisodes] = useState<(OmdbShowData & { showTitle: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const episodePromises = popularEpisodes.map(async (ep) => {
          try {
            const data = await fetchEpisodeData(ep.imdbID, ep.season, ep.episode);
            return { ...data, showTitle: ep.showTitle };
          } catch (error) {
            return {
              Title: ep.title,
              showTitle: ep.showTitle,
              Poster: `https://via.placeholder.com/300x450.png?text=${encodeURIComponent(ep.title)}`,
              Plot: `Episode ${ep.episode} of Season ${ep.season}`,
              imdbRating: "N/A",
              Year: "N/A",
              Response: "True"
            } as OmdbShowData & { showTitle: string };
          }
        });
        
        const episodeData = await Promise.all(episodePromises);
        setEpisodes(episodeData);
      } catch (error) {
        console.error('Error fetching popular episodes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEpisodes();
  }, []);
  
  const filteredEpisodes = episodes.filter((episode) => {
    const matchesShow = selectedShow ? episode.showTitle === selectedShow : true;
    return searchTerm 
      ? episode.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.showTitle.toLowerCase().includes(searchTerm.toLowerCase())
      : matchesShow;
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Popular Episodes</h2>
        <select
          value={selectedShow}
          onChange={(e) => setSelectedShow(e.target.value)}
          className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600"
        >
          <option value="">All Shows</option>
          {popularShows.map((show) => (
            <option key={show.imdbID} value={show.title}>
              {show.title}
            </option>
          ))}
        </select>
      </div>
      
      <input
        type="text"
        placeholder="Search episodes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-gray-700 text-white border border-gray-600 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredEpisodes.length > 0 ? (
          filteredEpisodes.map((episode, index) => (
            <div 
              key={index} 
              className="bg-gray-700 rounded p-3 relative overflow-hidden group cursor-pointer"
              onClick={() => onSelect && onSelect(episode)}
            >
              <img 
                src={episode.Poster} 
                alt={episode.Title} 
                className="w-full h-32 object-cover mb-2 rounded" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x450.png?text=${encodeURIComponent(episode.Title)}`;
                }}
              />
              <h3 className="text-md font-bold">{episode.showTitle}</h3>
              <p className="text-gray-400 text-sm">{episode.Title} - S{episode.Season}E{episode.Episode}</p>
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
                <p className="text-white text-center p-4 text-sm">{episode.Plot || `Episode from ${episode.showTitle}`}</p>
                {episode.imdbRating !== "N/A" && (
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                    IMDb: {episode.imdbRating}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-400">
            No episodes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularEpisodes;
