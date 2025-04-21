import React, { useState } from 'react';

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
  existing?: any;
  onCompleted: () => void;
  onSubmit: (form: FormProps, existing: any) => void;
}

const EpisodeForm: React.FC<Props> = ({ existing, onCompleted, onSubmit }) => {
  const isEdit = Boolean(existing);
  const [form, setForm] = useState({
    series: existing?.series || '',
    title: existing?.title || '',
    description: existing?.description || '',
    seasonNumber: existing?.seasonNumber || 1,
    episodeNumber: existing?.episodeNumber || 1,
    releaseDate: existing?.releaseDate || '',
    imdbId: existing?.imdbId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, existing);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
      <input
        value={form.series}
        onChange={e => setForm({ ...form, series: e.target.value })}
        placeholder="Series"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        placeholder="Title"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <textarea
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        type="number"
        value={form.seasonNumber}
        onChange={e => setForm({ ...form, seasonNumber: +e.target.value })}
        placeholder="Season Number"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        type="number"
        value={form.episodeNumber}
        onChange={e => setForm({ ...form, episodeNumber: +e.target.value })}
        placeholder="Episode Number"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        type="date"
        value={form.releaseDate}
        onChange={e => setForm({ ...form, releaseDate: e.target.value })}
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <input
        value={form.imdbId}
        onChange={e => setForm({ ...form, imdbId: e.target.value })}
        placeholder="IMDb ID"
        className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          {isEdit ? 'Update' : 'Create'} Episode
        </button>
        <button
          type="button"
          onClick={onCompleted}
          className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EpisodeForm;
