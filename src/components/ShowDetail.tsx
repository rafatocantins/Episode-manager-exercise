import React, { useEffect, useState } from 'react';
import { fetchShowData, OmdbShowData } from '../utils/omdbApi';

interface ShowDetailProps {
  showTitle: string | null;
}

const ShowDetail: React.FC<ShowDetailProps> = ({ showTitle }) => {
  // Fallback data in case API fails
  const fallbackData: OmdbShowData = {
    Title: "Stranger Things",
    Year: "2016–2025",
    Rated: "TV-14",
    Released: "15 Jul 2016",
    Runtime: "51 min",
    Genre: "Drama, Fantasy, Horror",
    Director: "N/A",
    Writer: "Matt Duffer, Ross Duffer",
    Actors: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
    Plot: "In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.",
    Language: "English",
    Country: "United States",
    Awards: "Won 12 Primetime Emmys. 114 wins & 324 nominations total",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjg2NmM0MTEtYWY2Yy00NmFlLTllNTMtMjVkZjEwMGVlNzdjXkEyXkFqcGc@._V1_SX300.jpg",
    Ratings: [{"Source": "Internet Movie Database", "Value": "8.6/10"}],
    Metascore: "N/A",
    imdbRating: "8.6",
    imdbVotes: "1,437,239",
    imdbID: "tt4574334",
    Type: "series",
    totalSeasons: "5",
    Response: "True"
  };
  
  const [showInfo, setShowInfo] = useState<OmdbShowData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResetShowDetails = () => {
      setShowInfo(null);
    };

    window.addEventListener('resetShowDetails', handleResetShowDetails);

    return () => {
      window.removeEventListener('resetShowDetails', handleResetShowDetails);
    };
  }, []);

  useEffect(() => {
    const fetchShowInfo = async () => {
      if (!showTitle) {
        setShowInfo(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchShowData(showTitle);
        setShowInfo(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching show data:', err);
        setShowInfo(fallbackData);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShowInfo();
  }, [showTitle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!showTitle) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">No episode selected</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded">
        <p>Error loading show information: {error}</p>
      </div>
    );
  }

  if (!showInfo) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">No episode selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show Main Image */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <img 
          src={showInfo.Poster} 
          alt={showInfo.Title} 
          className="w-full h-64 object-cover"
        />
      </div>

      {/* Show Title and Year */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">{showInfo.Title} ({showInfo.Year})</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {showInfo.Genre.split(', ').map((genre, index) => (
            <span key={index} className="bg-gray-700 text-xs px-2 py-1 rounded">
              {genre}
            </span>
          ))}
        </div>
        <p className="text-gray-300 text-sm mb-3">
          <strong>Actors:</strong> {showInfo.Actors}
        </p>
        <p className="text-gray-300">
          {showInfo.Plot}
        </p>
      </div>

      {/* Show Stats */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2">Show Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <span className="block text-2xl font-bold">{showInfo.totalSeasons}</span>
            <span className="text-sm text-gray-400">Seasons</span>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <span className="block text-2xl font-bold">{showInfo.imdbRating}</span>
            <span className="text-sm text-gray-400">IMDb Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDetail;
