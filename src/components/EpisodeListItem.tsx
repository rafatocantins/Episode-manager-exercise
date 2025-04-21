import React, { useState, useEffect } from 'react';
import { getEpisodeData } from '../utils/omdbApi';

interface EpisodeListItemProps {
  id: string;
  series: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  averageRating?: number; // Optional for now
  onSelect: (id: string) => void;
  isSelected: boolean; // To highlight the selected item
}

// Placeholder image URL
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/100x56/1f2937/6b7280?text=No+Image"; // Dark placeholder

const EpisodeListItem: React.FC<EpisodeListItemProps> = ({
  id,
  series,
  title,
  seasonNumber,
  episodeNumber,
  averageRating,
  onSelect,
  isSelected,
}) => {
  const [episodeImageUrl, setEpisodeImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchEpisodeImage = async () => {
      try {
        const episodeData = await getEpisodeData(series, seasonNumber, episodeNumber);
        setEpisodeImageUrl(episodeData.Poster);
      } catch (error) {
        console.error('Error fetching episode image:', error);
      }
    };

    fetchEpisodeImage();
  }, [series, seasonNumber, episodeNumber]);

  const displayRating = averageRating ? averageRating.toFixed(1) : 'N/A';
  const imageSrc = episodeImageUrl || PLACEHOLDER_IMAGE;

  // Conditional styling for selected item
  const itemClasses = `
    flex items-center p-3 space-x-3 cursor-pointer rounded-md transition-colors duration-150 ease-in-out border
    ${isSelected
      ? 'bg-primary bg-opacity-20 border-primary' // Highlight selected
      : 'bg-gray-750 hover:bg-gray-700 border-gray-700 hover:border-gray-600' // Default and hover
    }
  `;

  return (
    <li className={itemClasses} onClick={() => onSelect(id)}>
      {/* Left Side: Image */}
      <div className="w-24 h-16"> {/* Fixed size for image container */}
        <img
          src={imageSrc}
          alt={`${series} - ${title}`}
          className="w-full h-16 object-cover rounded" // Cover ensures image fills space
        />
      </div>

      {/* Right Side: Details */}
      <div className="flex-1 min-w-0"> {/* min-w-0 prevents text overflow issues */}
        <p className={`font-semibold truncate ${isSelected ? 'text-gray-100' : 'text-gray-200'}`}>
          {title}
        </p>
        <p className={`text-sm truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
          {series} - S{seasonNumber}E{episodeNumber}
        </p>
        <div className="flex items-center mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-300'}`}>
            {displayRating}
          </span>
        </div>
      </div>
    </li>
  );
};

export default EpisodeListItem;
