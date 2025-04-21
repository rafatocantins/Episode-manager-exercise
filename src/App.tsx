import React, { useState, useEffect } from 'react';
import { useDebounce } from './hooks/useDebounce';
import SearchBar from './components/SearchBar';
import EpisodeList from './components/EpisodeList';
import EpisodeDetail from './components/EpisodeDetail';
import EpisodeForm from './components/EpisodeForm';
import ShowDetail from './components/ShowDetail';
import PopularEpisodes from './components/PopularEpisodes'; // Ensure this file exists in the components folder
import Modal from './components/Modal';
import { useSubscription, useMutation, useQuery } from '@apollo/client';
import { ON_CREATE, ON_DELETE, ON_UPDATE, CREATE_EPISODE, UPDATE_EPISODE, LIST_EPISODES } from './graphql/queries';
import { OmdbShowData } from './utils/omdbApi';

interface Episode {
  id: string;
  series: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  description: string;
  imageUrl?: string;
}

interface FormProps {
  series: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  releaseDate: string;
  imdbId: string;
}

interface EpisodeFormProps {
  existing?: any;
  onCompleted: () => void;
  onSubmit: (form: FormProps, existing: any) => void;
}

const mockEpisodes: Episode[] = [
  {
    id: '1',
    series: 'Stranger Things',
    title: 'The Vanishing of Will Byers',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjI1ODk2NjYwNF5BMl5BanBnXkEycGhvcg.jpg',
  },
  {
    id: '2',
    series: 'The Crown',
    title: 'Wolferton Splash',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'Princess Elizabeth marries Philip Mountbatten at Westminster Abbey. As King George VI’s health declines, Elizabeth is increasingly torn between her duty and her desire to be with her husband.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjI1ODk2NjYwNF5BMl5BanBnXkEycGhvcg.jpg',
  },
  {
    id: '3',
    series: 'Bridgerton',
    title: 'Diamond of the First Water',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'When a scandal sheet prints rumors about her, debutante Daphne Bridgerton enters a fake courtship with the rebellious Duke of Hastings, who has vowed to remain a bachelor.',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjI1ODk2NjYwNF5BMl5BanBnXkEycGhvcg.jpg',
  },
  {
    id: '4',
    series: 'Squid Game',
    title: 'Red Light, Green Light',
    seasonNumber: 1,
    episodeNumber: 1,
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BYWE3MDVkN2EtNjQ5MS00ZDQ4LTgwYjYtNjFkZDA4MDFjMmI4XkEyXkFqcGdeQXVyMTEzMTI3NDEz._V1_QL75_UX190_CR0,0,190,281_.jpg',
  },
  {
    id: '5',
    series: 'Dark',
    title: "Secrets",
    seasonNumber: 1,
    episodeNumber: 1,
    description: "A child's disappearance triggers fear and a frantic hunt in a small German town. Secrets begin to unravel, and tangled relationships emerge.",
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjMwMDgyOGQ2OV5BMl5BanBnXkEycGhvcg.jpg',
  },
  {
    id: '6',
    series: 'Money Heist',
    title: "Efectuar la entrada",
    seasonNumber: 1,
    episodeNumber: 1,
    description: "Eight thieves take hostages and lock themselves in the Royal Mint of Spain as a criminal mastermind manipulates the police to carry out his plan.",
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BNDJkYzNkMmQtMWM0ZC00MDBiLWFmMjYtZDU4NzQ3MmQ4MzQ1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_QL75_UX190_CR0,3,190,281_.jpg',
  },
];

const App: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const debounced = useDebounce(search, 400);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [createEpisode] = useMutation(CREATE_EPISODE);
  const [updateEpisode] = useMutation(UPDATE_EPISODE);
  const [mockSearch, setMockSearch] = useState<string>('');
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [selectedApiSeries, setSelectedApiSeries] = useState<string>('');
  const [apiSeasons, setApiSeasons] = useState<number[]>([]);

  const filteredMockEpisodes = mockEpisodes.filter((episode) =>
    (episode.title.toLowerCase().includes(mockSearch.toLowerCase()) ||
      episode.series.toLowerCase().includes(mockSearch.toLowerCase())) &&
    (selectedSeries === '' || episode.series === selectedSeries)
  );

  const { data: created } = useSubscription(ON_CREATE);
  const { data: updated } = useSubscription(ON_UPDATE);
  const { data: deleted } = useSubscription(ON_DELETE);

  useEffect(() => {
    if (created) console.log('Created:', created.onCreateEpisode);
  }, [created]);

  useEffect(() => {
    if (updated) console.log('Updated:', updated.onUpdateEpisode);
  }, [updated]);

  useEffect(() => {
    if (deleted) {
      console.log('Deleted:', deleted.onDeleteEpisode);
      if (deleted.onDeleteEpisode === selectedId) setSelectedId(null);
    }
  }, [deleted, selectedId]);

  const handleSubmit = async (form: FormProps, existing: any) => {
    const isEdit = Boolean(existing);
    const input = { id: existing?.id || Date.now().toString(), ...form };
    try {
      if (isEdit) {
        await updateEpisode({ variables: { input } });
      } else {
        await createEpisode({ variables: { input } });
      }
      setToastType('success');
      setToastMessage(`Episode ${isEdit ? 'updated' : 'created'} successfully!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setToastType('error');
      setToastMessage(`Failed to ${isEdit ? 'update' : 'create'} episode: ${error.message}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Calculate total seasons and episodes for the selected series
  const getShowStats = () => {
    if (!selectedApiSeries) return { seasons: 0, episodes: 0 };
    
    const seasons = apiSeasons.length;
    const episodes = data?.listEpisodes?.filter((ep: any) => 
      ep.series === selectedApiSeries
    ).length || 0;
    
    return { seasons, episodes };
  };

  const { data } = useQuery(LIST_EPISODES, { 
    variables: { search: '', series: selectedApiSeries },
    skip: !selectedApiSeries
  });

  const showStats = getShowStats();

  return (
    <div className="container mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-6">Episode Manager</h1>
      <button
        onClick={() => { setShowForm(true); setSelectedId(null); }}
        className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded"
        type="button"
        aria-label="New Episode"
        title="Create a new episode"
        role="button"
      >
        + New Episode
      </button>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Show Details from OMDB API */}
          <ShowDetail />

          {/* Popular Episodes Section */}
          <PopularEpisodes 
            onSelect={(episodeData) => {
              console.log('Selected episode:', episodeData);
              // You could add additional functionality here if needed
            }}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Season Filter and Search */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex flex-col gap-4 mb-4">
              <h2 className="text-xl font-bold">Episodes</h2>
              <div className="flex gap-4 items-center">
                <label className="text-gray-300">Filter by Season:</label>
                <select
                  value={selectedApiSeries}
                  onChange={(e) => setSelectedApiSeries(e.target.value)}
                  className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600 flex-grow"
                >
                  <option value="">All Shows</option>
                  {apiSeasons.map((season) => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 block mb-1">Search Episodes:</label>
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className='mb-4'>
                <EpisodeList
                  search={debounced}
                  onSelect={(id) => { setSelectedId(id); setShowForm(false); }}
                  series={selectedApiSeries}
                  onSeasonsLoaded={(seasons) => setApiSeasons(seasons)}
                  selectedSeason={selectedSeries}
                  selectedEpisodeId={selectedId} // Pass the selected ID state
                />
              </div>
            </div>
          </div>

          {/* Episode Detail */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">Episode Details</h3>
            <div className="min-h-[200px]">
              <EpisodeDetail id={selectedId} />
            </div>
          </div>
        </div>
      </div>
      {showForm && (
        <Modal show={showForm} onClose={() => setShowForm(false)} >
          <h2 className="text-2xl font-bold mb-4">
            {selectedId ? 'Edit Episode' : 'Create New Episode'}
          </h2>
          <EpisodeForm
            existing={null}
            onCompleted={() => setShowForm(false)}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}

      {showToast && toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded text-white ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
