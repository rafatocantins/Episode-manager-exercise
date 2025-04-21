import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-md">
      <div className="bg-gray-800 text-white p-8 rounded shadow-lg z-10 relative max-w-lg w-full">
        {children}
      </div>
    </div>
  );
};

export default Modal;
