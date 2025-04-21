import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Search episodes..."
    value={value}
    onChange={e => onChange(e.target.value)}
    className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  />
);

export default SearchBar;
