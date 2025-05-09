import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EPISODE, UPDATE_EPISODE, CREATE_EPISODE } from '../graphql/queries';
import { toast } from 'react-toastify';
import { useDebounce } from '../hooks/useDebounce';
import { searchShow, fetchSeasons, fetchEpisodesForSeason, fetchEpisodeDetails, SearchResult, Season, Episode } from '../utils/omdbApi';
import { mockEpisodes, getEpisodeById, updateEpisodeById } from '../utils/mockData';

interface FormProps {
  series: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  releaseDate: string;
  imdbId: string;
}

interface Props {
  episodeId: string | null;
  onClose: () => void;
}

const EpisodeForm: React.FC<Props> = ({ episodeId, onClose }) => {
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(!!episodeId);
  
  const { data, loading, error } = useQuery(GET_EPISODE, {
    variables: { id: episodeId },
    skip: !episodeId || useMockData,
    onError: () => {
      // If GraphQL fails, switch to mock data
      setUseMockData(true);
    }
  });

  const [updateEpisode, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_EPISODE);
  const [createEpisode, { loading: createLoading, error: createError }] = useMutation(CREATE_EPISODE);

  const [form, setForm] = useState<FormProps>({
    series: '',
    title: '',
    description: '',
    seasonNumber: 1,
    episodeNumber: 1,
    releaseDate: '',
    imdbId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedShow, setSelectedShow] = useState<SearchResult | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load data from GraphQL or mock data
  useEffect(() => {
    if (episodeId) {
      if (useMockData) {
        // Get data from mock
        const mockEpisode = getEpisodeById(episodeId);
        if (mockEpisode) {
          setForm({
            series: mockEpisode.series,
            title: mockEpisode.title,
            description: mockEpisode.description,
            seasonNumber: mockEpisode.seasonNumber,
            episodeNumber: mockEpisode.episodeNumber,
            releaseDate: mockEpisode.releaseDate,
            imdbId: mockEpisode.imdbId
          });
        }
      } else if (data?.getEpisodeById) {
        // Get data from GraphQL
        const { series, title, description, seasonNumber, episodeNumber, releaseDate, imdbId } = data.getEpisodeById;
        setForm({
          series,
          title,
          description,
          seasonNumber,
          episodeNumber,
          releaseDate,
          imdbId
        });
      }
    }
  }, [data, episodeId, useMockData]);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedSearchTerm) {
        const results = await searchShow(debouncedSearchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  const handleFetchSeasons = async (show: SearchResult) => {
    const availableSeasons = await fetchSeasons(show);
    setSeasons(availableSeasons);
  };

  const handleFetchEpisodes = async (show: SearchResult, seasonNumber: number) => {
    const episodesData = await fetchEpisodesForSeason(show, seasonNumber);
    setEpisodes(episodesData);
  };

  const handleShowSelect = (show: SearchResult) => {
    setSelectedShow(show);
    handleFetchSeasons(show);
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    if (selectedShow) {
      handleFetchEpisodes(selectedShow, seasonNumber);
    }
  };

  const handleEpisodeSelect = async (imdbID: string) => {
    const episodeDetails = await fetchEpisodeDetails(imdbID);

    if (episodeDetails) {
      setSelectedEpisode(episodeDetails);
      let formattedDate = '';
      if (episodeDetails.Released) {
        const dateParts = episodeDetails.Released.split(' ');
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        const monthNumber = new Date(Date.parse(month + " 1, " + year)).getMonth() + 1;
        formattedDate = `${year}-${monthNumber.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      setForm({
        series: selectedShow?.Title || '',
        title: episodeDetails.Title,
        description: episodeDetails.Plot,
        seasonNumber: Number(episodeDetails.Season),
        episodeNumber: Number(episodeDetails.Episode),
        releaseDate: formattedDate,
        imdbId: episodeDetails.imdbID,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (episodeId) {
        // Update existing episode
        if (useMockData) {
          // Update in mock data
          const success = updateEpisodeById(episodeId, {
            description: form.description,
            seasonNumber: form.seasonNumber,
            episodeNumber: form.episodeNumber,
            releaseDate: form.releaseDate
          });
          
          if (success) {
            toast.success("Episode updated successfully in mock data!");
            // Trigger a refresh of the episode list and details
            window.dispatchEvent(new CustomEvent('mockDataChanged'));
          } else {
            toast.error("Failed to update episode in mock data");
          }
        } else {
          // Try GraphQL update
          await updateEpisode({ 
            variables: { 
              input: { 
                id: episodeId, 
                description: form.description,
                seasonNumber: form.seasonNumber,
                episodeNumber: form.episodeNumber,
                releaseDate: form.releaseDate,
                // Include these fields to satisfy GraphQL schema
                series: form.series,
                title: form.title,
                imdbId: form.imdbId
              } 
            } 
          });
          toast.success("Episode updated successfully!");
        }
      } else {
        // Create new episode
        await createEpisode({ variables: { input: form } });
        toast.success("Episode created successfully!");
      }
      onClose();
    } catch (err) {
      const action = episodeId ? 'update' : 'create';
      toast.error(`Failed to ${action} episode`);
      
      // If GraphQL update fails, try to update mock data as fallback
      if (episodeId) {
        const success = updateEpisodeById(episodeId, {
          description: form.description,
          seasonNumber: form.seasonNumber,
          episodeNumber: form.episodeNumber,
          releaseDate: form.releaseDate
        });
        
        if (success) {
          toast.success("Episode updated successfully in mock data!");
          // Trigger a refresh of the episode list and details
          window.dispatchEvent(new CustomEvent('mockDataChanged'));
        }
      } else {
        // For create operation, add to mock data
        const newEpisode = {
          id: Math.random().toString(),
          series: selectedShow?.Title || form.series,
          title: form.title,
          description: form.description,
          seasonNumber: form.seasonNumber,
          episodeNumber: form.episodeNumber,
          releaseDate: form.releaseDate,
          imdbId: form.imdbId,
        };
        mockEpisodes.push(newEpisode);
        // Trigger a refresh of the episode list and series list
        window.dispatchEvent(new CustomEvent('mockDataChanged'));
        toast.success("Episode created successfully on mock data!");
      }
      onClose();
    }
  };

  const isMutating = updateLoading || createLoading;

  const isFormValid = () => {
    return (
      form.series !== '' &&
      form.title !== '' &&
      form.description !== '' &&
      form.seasonNumber !== 0 &&
      form.episodeNumber !== 0 &&
      form.releaseDate !== '' &&
      form.imdbId !== ''
    );
  };

  if (loading) return <p>Loading...</p>;
  // Display mutation errors if they occur
  if (error || updateError || createError) {
    const errorMessage = error?.message || updateError?.message || createError?.message || 'An error occurred';
    return (
      <div>
        <p>Error: {errorMessage}</p>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Simplified form validation for edit mode
  const isEditFormValid = () => {
    return (
      form.description !== '' &&
      form.seasonNumber !== 0 &&
      form.episodeNumber !== 0 &&
      form.releaseDate !== ''
    );
  };

  // Render different forms based on whether we're editing or creating
  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
      {useMockData && (
        <div className="mb-4 p-2 text-center text-xs bg-yellow-900 bg-opacity-50 border border-yellow-700 text-yellow-300 rounded">
          {isEditMode ? "Editing Offline Data" : "Creating with Offline Data"}
        </div>
      )}
      
      {/* Show series and title info in edit mode but don't allow changes */}
      {isEditMode && (
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="searchSeries">Series</label>
          <h3 className="text-md text-gray-300 mb-4">{form.series}</h3>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="searchSeries">Episode Name</label>
          <h4 className="text-md text-gray-300 mb-4">{form.title}</h4>
        </div>
      )}
      
      {/* Only show search and selection fields in create mode */}
      {!isEditMode && (
        <>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="searchSeries">Search Series</label>
          <input
            type="text"
            id="searchSeries"
            placeholder="Search Series"
            className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label className="block text-white text-sm font-bold mb-2" htmlFor="selectSeries">Select Series</label>
          <select
            id="selectSeries"
            value={form.series}
            onChange={(e) => {
              const selected = searchResults.find((result) => result.Title === e.target.value);
              if (selected) {
                handleShowSelect(selected);
                setForm({ ...form, series: e.target.value });
              }
            }}
            className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600"
          >
            <option value="">Select Series</option>
            {searchResults.map((result) => (
              <option key={result.imdbID} value={result.Title}>
                {result.Title} ({result.Year})
              </option>
            ))}
          </select>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="selectSeason">Select Season</label>
          <select
            id="selectSeason"
            value={selectedSeason || ''}
            onChange={(e) => handleSeasonSelect(Number(e.target.value))}
            className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600"
          >
            <option value="">Select Season</option>
            {seasons.map((season) => (
              <option key={season.seasonNumber} value={season.seasonNumber}>
                Season {season.seasonNumber}
              </option>
            ))}
          </select>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="selectEpisode">Select Episode</label>
          <select
            value={selectedEpisode ? selectedEpisode.Title : ''}
            onChange={(e) => handleEpisodeSelect(e.target.value)}
            className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600"
          >
            <option value="">{selectedEpisode ? selectedEpisode.Title : 'Select Episode'}</option>
            {episodes.map((episode) => (
              <option key={episode.imdbID} value={episode.imdbID}>
                {episode.Title} (Episode {episode.episodeNumber})
              </option>
            ))}
          </select>
        </>
      )}
      
      {/* These fields are always shown, for both create and edit modes */}
      <label className="block text-white text-sm font-bold mb-2" htmlFor="description">Description</label>
      <textarea
        id="description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        rows={4}
      />
      <label className="block text-white text-sm font-bold mb-2" htmlFor="seasonNumber">Season Number</label>
      <input
        type="number"
        id="seasonNumber"
        value={form.seasonNumber}
        onChange={(e) => setForm({ ...form, seasonNumber: +e.target.value })}
        placeholder="Season Number"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <label className="block text-white text-sm font-bold mb-2" htmlFor="episodeNumber">Episode Number</label>
      <input
        type="number"
        id="episodeNumber"
        value={form.episodeNumber}
        onChange={(e) => setForm({ ...form, episodeNumber: +e.target.value })}
        placeholder="Episode Number"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <label className="block text-white text-sm font-bold mb-2" htmlFor="releaseDate">Release Date</label>
      <input
        type="date"
        id="releaseDate"
        value={form.releaseDate}
        onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      
      {/* Only show IMDb ID field in create mode */}
      {!isEditMode && (
        <>
          <label className="block text-white text-sm font-bold mb-2" htmlFor="imdbId">IMDb ID</label>
          <input
            id="imdbId"
            value={form.imdbId}
            onChange={(e) => setForm({ ...form, imdbId: e.target.value })}
            placeholder="IMDb ID"
            className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </>
      )}
      
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="submit"
          disabled={isMutating || (isEditMode ? !isEditFormValid() : !isFormValid())}
          className={`bg-primary text-white py-2 px-4 rounded hover:bg-red-700 transition-colors ${isMutating || (isEditMode ? !isEditFormValid() : !isFormValid()) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isMutating ? 'Saving...' : (episodeId ? 'Update' : 'Create') + ' Episode'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EpisodeForm;
