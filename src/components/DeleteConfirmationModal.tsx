import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  resetShowDetails: () => void;
}

const DeleteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onDelete, resetShowDetails }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"></div>
      
      {/* Modal content */}
      <div className="flex items-center justify-center h-full">
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl relative max-w-lg w-full border border-red-500 z-50">
          <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
          <p className="mb-4">Are you sure you want to delete this episode?</p>
          <div className="flex justify-end space-x-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={() => {
                onDelete();
                resetShowDetails();
              }}
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
    </div>
  );
};

export default DeleteConfirmationModal;
