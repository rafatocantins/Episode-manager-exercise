import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EPISODE, UPDATE_EPISODE, CREATE_EPISODE } from '../graphql/queries';
import { toast } from 'react-toastify';
import { useDebounce } from '../hooks/useDebounce';
import { searchShow } from '../utils/omdbApi';
import { mockEpisodes } from '../utils/mockData';

interface FormProps {
  series: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  releaseDate: string;
  imdbId: string;
}

interface SearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
}

interface Props {
  episodeId: string | null;
  onClose: () => void;
}

interface Season {
  seasonNumber: number;
}

interface Episode {
  Title: string;
  imdbID: string;
  Plot: string;
  Released: string;
  Season: string;
  episodeNumber: string;
}

const EpisodeForm: React.FC<Props> = ({ episodeId, onClose }) => {
  const { data, loading, error } = useQuery(GET_EPISODE, {
    variables: { id: episodeId },
    skip: !episodeId,
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

  useEffect(() => {
    if (data?.getEpisodeById) {
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
  }, [data]);

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

  const fetchSeasons = async (show: SearchResult) => {
    let seasonNumber = 1;
    const availableSeasons: Season[] = [];

    while (true) {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?t=${encodeURIComponent(show.Title)}&Season=${seasonNumber}&apikey=41d28581`
        );
        const data = await response.json();

        if (data.Response === 'False') {
          break;
        }

        availableSeasons.push({ seasonNumber });
        seasonNumber++;
      } catch (error) {
        console.error('Error fetching seasons:', error);
        break;
      }
    }

    setSeasons(availableSeasons);
  };

  const fetchEpisodes = async (show: SearchResult, seasonNumber: number) => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(show.Title)}&Season=${seasonNumber}&apikey=41d28581`
      );
      const data = await response.json();

      if (data.Response === 'False' || !data.Episodes) {
        setEpisodes([]);
        return;
      }

      const episodesWithDetails: Episode[] = await Promise.all(
        data.Episodes.map(async (episode: any) => {
          const episodeDetails = await fetchEpisodeDetails(episode.imdbID);
          return {
            Title: episode.Title,
            imdbID: episode.imdbID,
            Plot: episodeDetails?.Plot || '',
            Released: episodeDetails?.Released || '',
            Season: episodeDetails?.Season || '',
            episodeNumber: episode.Episode,
          };
        })
      );

      setEpisodes(episodesWithDetails);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      setEpisodes([]);
    }
  };

  const fetchEpisodeDetails = async (imdbID: string) => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&apikey=41d28581`
      );
      const data = await response.json();

      if (data.Response === 'False') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching episode details:', error);
      return null;
    }
  };

  const handleShowSelect = (show: SearchResult) => {
    setSelectedShow(show);
    fetchSeasons(show);
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    if (selectedShow) {
      fetchEpisodes(selectedShow, seasonNumber);
    }
  };

  const handleEpisodeSelect = async (imdbID: string) => {
    const episodeDetails = await fetchEpisodeDetails(imdbID);

    if (episodeDetails) {
      setSelectedEpisode(episodeDetails);
      const releasedDate = episodeDetails.Released;
      let formattedDate = '';
      if (releasedDate) {
        const dateParts = releasedDate.split(' ');
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        const monthNumber = new Date(Date.parse(month +" 1, "+ year)).getMonth()+1;
        formattedDate = `${year}-${monthNumber.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      setForm({
        series: episodeDetails.seriesID || selectedShow?.Title || '',
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
        await updateEpisode({ variables: { input: { id: episodeId, ...form } } });
        toast.success("Episode updated successfully!");
      } else {
        // Create new episode
        await createEpisode({ variables: { input: form } });
        toast.success("Episode created successfully!");
      }
      onClose();
    } catch (err) {
      const action = episodeId ? 'update' : 'create';
      console.error(`Failed to ${action} episode`, err);
      toast.error(`Failed to ${action} episode`);
    } finally {
      if (!episodeId) {
        mockEpisodes.push({
          id: Math.random().toString(),
          series: form.series,
          title: form.title,
          description: form.description,
          seasonNumber: form.seasonNumber,
          episodeNumber: form.episodeNumber,
          releaseDate: form.releaseDate,
          imdbId: form.imdbId,
        });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
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
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="">{selectedEpisode ? selectedEpisode.Title : 'Select Episode'}</option>
        {episodes.map((episode) => (
          <option key={episode.imdbID} value={episode.imdbID}>
            {episode.Title} (Episode {episode.episodeNumber})
          </option>
        ))}
      </select>
      <label className="block text-white text-sm font-bold mb-2" htmlFor="description">Description</label>
      <textarea
        id="description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
      <label className="block text-white text-sm font-bold mb-2" htmlFor="imdbId">IMDb ID</label>
      <input
        value={form.imdbId}
        onChange={(e) => setForm({ ...form, imdbId: e.target.value })}
        placeholder="IMDb ID"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          disabled={isMutating || !isFormValid()}
          className={`bg-primary text-white py-2 px-4 rounded hover:bg-red-700 transition-colors ${isMutating || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
