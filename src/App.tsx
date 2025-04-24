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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSeriesList as getMockSeriesList } from './utils/mockData';

const App: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const debounced = useDebounce(search, 400);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedShowTitle, setSelectedShowTitle] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [selectedApiSeries, setSelectedApiSeries] = useState<string>('');

  useEffect(() => {
    const handleClearShowTitle = () => {
      setSelectedShowTitle(null);
    };

    window.addEventListener('clearShowTitle', handleClearShowTitle);

    return () => {
      window.removeEventListener('clearShowTitle', handleClearShowTitle);
    };
  }, []);
  const [apiSeasons, setApiSeasons] = useState<number[]>([]);
  const [seriesList, setSeriesList] = useState<string[]>([]);

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
      if (deleted.onDeleteEpisode === selectedId) {
        setSelectedId(null);
        // Force a refresh of the episode list
        window.dispatchEvent(new CustomEvent('mockDataChanged'));
      }
    }
  }, [deleted, selectedId]);

  // Calculate total seasons and episodes for the selected series
  const getShowStats = () => {
    if (!selectedApiSeries) return { seasons: 0, episodes: 0 };

    const seasons = apiSeasons.length;
    const episodes = data?.listEpisodes?.filter((ep: any) =>
      ep.series === selectedApiSeries
    ).length || 0;

    return { seasons, episodes };
  };

  // Listen for mock data changes to update series list
  useEffect(() => {
    const handleMockDataChanged = () => {
      console.log('App: Mock data changed event received');
      const mockSeries = getMockSeriesList();
      setSeriesList(mockSeries);
    };

    const handleEpisodeDeleted = (event: any) => {
      console.log('App: Episode deleted event received', event.detail);
      // Clear the selected episode ID
      setSelectedId(null);
    };

    window.addEventListener('mockDataChanged', handleMockDataChanged);
    window.addEventListener('episodeDeleted', handleEpisodeDeleted);
    
    // Initial load
    const mockSeries = getMockSeriesList();
    setSeriesList(mockSeries);
    
    return () => {
      window.removeEventListener('mockDataChanged', handleMockDataChanged);
      window.removeEventListener('episodeDeleted', handleEpisodeDeleted);
    };
  }, []);

  const { data } = useQuery(LIST_EPISODES, {
    variables: { search: debounced, series: selectedApiSeries },
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
    
        {/* left Column */}
        <div className="space-y-6">
          {/* Season Filter and Search */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex flex-col gap-4 mb-4">
              <h2 className="text-xl font-bold">Episodes</h2>
              <div className="flex gap-4 items-center">
                <label className="text-gray-300">Filter by Show:</label>
                <select
                  value={selectedApiSeries}
                  onChange={(e) => setSelectedApiSeries(e.target.value)}
                  className="appearance-none bg-gray-700 text-white border border-gray-600 rounded py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23ffffff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] hover:bg-gray-600 flex-grow"
                >
                  <option value="">All Shows</option>
                  {seriesList.map((series) => (
                    <option key={series} value={series}>
                      {series}
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
                  onSelect={(id, series) => { setSelectedId(id); setSelectedShowTitle(series); setShowForm(false); }}
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
        {/* Left Column */}
        <div className="space-y-6">
          {/* Show Details from OMDB API */}
          <ShowDetail showTitle={selectedShowTitle} />

          {/* Popular Episodes Section */}
          <PopularEpisodes
            onSelect={(episodeData: OmdbShowData & { showTitle: string }) => {
              console.log('Selected episode:', episodeData);
              // You could add additional functionality here if needed
            }}
          />
        </div>
      </div>
      {showForm && (
        <Modal show={showForm} onClose={() => setShowForm(false)} >
          <h2 className="text-2xl font-bold mb-4">
            Create New Episode
          </h2>
          <EpisodeForm
            episodeId={null}
            onClose={() => setShowForm(false)}
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default App;
