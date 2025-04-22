import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-md">
      <div className="bg-gray-800 text-white p-8 rounded shadow-lg z-10 relative max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="mb-4">Are you sure you want to delete this episode?</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
