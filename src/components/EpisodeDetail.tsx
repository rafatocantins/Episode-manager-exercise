import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EPISODE, DELETE_EPISODE } from '../graphql/queries';
import { getEpisodeById as getMockEpisode, deleteEpisodeById } from '../utils/mockData';
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
      setUseMockData(true);
    }
  });

  const [deleteEpisode, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_EPISODE);

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      if (useMockData) {
        // Delete from mock data if we're in mock mode
        const deleted = deleteEpisodeById(id);
        if (deleted) {
          toast.success("Episode deleted successfully from mock data!");
          
          // Dispatch a custom event to notify other components // new solution
          // This will trigger a refresh in the parent component or any other component listening for this event
          window.dispatchEvent(new CustomEvent('mockDataChanged'));
          
          // Clear the selected episode ID by dispatching a custom event
          window.dispatchEvent(new CustomEvent('episodeDeleted', { detail: { id } }));
        } else {
          toast.error("Failed to delete episode from mock data");
        }
      } else {
        // Try to delete using GraphQL
        await deleteEpisode({ variables: { id } });
        toast.success("Episode deleted successfully!");
        
        // Clear the selected episode ID by dispatching a custom event
        window.dispatchEvent(new CustomEvent('episodeDeleted', { detail: { id } }));
      }
    } catch (err) {
      
      // Fallback to mock data if GraphQL fails
      const deleted = deleteEpisodeById(id);
      if (deleted) {
        toast.success("Episode deleted successfully from mock data!");
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('mockDataChanged'));
        
        // Clear the selected episode ID by dispatching a custom event
        window.dispatchEvent(new CustomEvent('episodeDeleted', { detail: { id } }));
      } else {
        toast.error("Failed to delete episode");
      }
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
  
  // Listen for episode deleted events to clear the detail view if needed
  useEffect(() => {
    const handleEpisodeDeleted = (event: any) => {
      const deletedId = event.detail?.id;
      if (deletedId === id) {
        // This is the episode we're currently displaying, so clear it
        setMockEpisode(null);
      }
    };
    
    window.addEventListener('episodeDeleted', handleEpisodeDeleted);
    
    return () => {
      window.removeEventListener('episodeDeleted', handleEpisodeDeleted);
    };
  }, [id]);

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
           <p className="mt-2 text-sm text-gray-300">
             The episode may have been deleted. Please select another episode from the list.
           </p>
         </div>
       );
     }
     // Generic not found / deleted message if not specifically a mock data issue
     return (
       <div className="p-6 text-center text-gray-500 bg-gray-800 rounded-lg shadow-md border border-gray-700">
         Episode not found or may have been deleted.
         <p className="mt-2 text-sm text-gray-400">
           Please select another episode from the list.
         </p>
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
      
      {/* Render the delete confirmation modal at the root level using React Portal - this ensures it's always visible above all other contents */}
      {ReactDOM.createPortal(
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={() => {
            handleDelete();
            setIsDeleteModalOpen(false);
          }}
        />,
        document.body
      )}

      {/* Analytics section */}
      <EpisodeAnalytics />
    </div>
  );
};

export default EpisodeDetail;
