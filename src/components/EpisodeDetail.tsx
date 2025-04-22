import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EPISODE, DELETE_EPISODE } from '../graphql/queries';
import { getEpisodeById as getMockEpisode } from '../utils/mockData';
import EpisodeAnalytics from './EpisodeAnalytics';
import Modal from './Modal'; // Import the Modal component
import EpisodeForm from './EpisodeForm';// Import EpisodeForm
import { toast } from 'react-toastify';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface Props {
  id: string | null;
}

const EpisodeDetail: React.FC<Props> = ({ id }) => {
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [mockEpisode, setMockEpisode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const { data, loading, error } = useQuery(GET_EPISODE, {
    variables: { id },
    skip: !id || useMockData,
    onError: () => {
      // If GraphQL fails, switch to mock data
      console.warn("GraphQL query failed, attempting to use mock data.");
      setUseMockData(true);
    }
  });

  const [deleteEpisode, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_EPISODE);

  const handleDelete = async () => {
    if (!id) {
      console.error("Episode ID is null or undefined");
      return;
    }

    try {
      await deleteEpisode({ variables: { id } });
      // Handle successful deletion (e.g., navigate back to episode list, show a success message)
      console.log("Episode deleted successfully");
      toast.success("Episode deleted successfully!");
      window.location.href = '/'; // Redirect to the home page after deletion
    } catch (err) {
      // Handle deletion error (e.g., show an error message)
      console.error("Failed to delete episode", err);
      toast.error("Failed to delete episode");
    }
  };

  // Load mock data if needed or if GraphQL failed
  useEffect(() => {
    if (useMockData && id) {
      const episode = getMockEpisode(id);
      if (episode) {
        setMockEpisode(episode);
      } else {
        console.warn(`Mock episode with ID ${id} not found.`);
        // Keep mockEpisode null if not found
      }
    }
  }, [useMockData, id]);

  // --- Themed Placeholder/Loading/Error States ---

  // No episode selected
  if (!id) return (
    <div className="p-6 text-center text-gray-500 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      Select an episode from the list to view details and analytics.
    </div>
  );

  // Loading state
  if (loading && !useMockData) return (
     <div className="p-6 text-center text-gray-400 bg-gray-800 rounded-lg shadow-md border border-gray-700 animate-pulse">
       Loading episode details...
     </div>
   );

  // GraphQL Error state (before switching to mock)
  if (error && !useMockData) {
    console.error('GraphQL Error:', error);
    return (
      <div className="p-4 md:p-6 bg-red-900 bg-opacity-40 border border-red-700 text-red-100 rounded-lg shadow-md">
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

  // Determine which data source to use
  let episodeData = null;
  if (useMockData) {
    episodeData = mockEpisode;
  } else if (data?.getEpisodeById) {
    episodeData = data.getEpisodeById;
  }

  // Episode not found (either via GraphQL or Mock)
  if (!episodeData) {
     // Check if we are in mock mode and mockEpisode is null (meaning it wasn't found)
     if (useMockData && !mockEpisode) {
       return (
         <div className="p-6 text-center text-yellow-400 bg-gray-800 rounded-lg shadow-md border border-yellow-700">
           Offline episode data for ID "{id}" not found.
         </div>
       );
     }
     // Generic not found / deleted message if not specifically a mock data issue
     return (
       <div className="p-6 text-center text-gray-500 bg-gray-800 rounded-lg shadow-md border border-gray-700">
         Episode not found or may have been deleted.
       </div>
     );
  }

  // --- Display Episode Details ---
  const { series, title, description, releaseDate, imdbId } = episodeData;
  return (
    // Themed container
    <div className="p-4 md:p-6 bg-gray-850 rounded-lg shadow-lg border border-gray-700 text-gray-200">
       {useMockData && (
         <div className="mb-4 p-2 text-center text-xs bg-yellow-900 bg-opacity-50 border border-yellow-700 text-yellow-300 rounded">
           Displaying Offline Data
         </div>
       )}
      <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">
        {series}: <span className="text-primary">{title}</span>
      </h2>
      <p className="mb-4 text-sm text-gray-400">
        Released: {new Date(releaseDate).toLocaleDateString()}
      </p>
      <p className="mb-4 text-gray-300 leading-relaxed">{description}</p>
      {imdbId && (
        <a
          href={`https://www.imdb.com/title/${imdbId}`}
          target="_blank"
          rel="noopener noreferrer" // Added for security
          className="inline-block text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-600 hover:border-yellow-500 px-3 py-1 rounded transition-colors mb-4"
        >
          View on IMDb
        </a>
      )}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Delete
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Edit
        </button>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EpisodeForm episodeId={id} onClose={() => setIsModalOpen(false)}/>
      </Modal>
      
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          handleDelete();
          setIsDeleteModalOpen(false);
        }}
      />

      {/* Analytics section (already themed) */}
      <EpisodeAnalytics />
    </div>
  );
};

export default EpisodeDetail;
