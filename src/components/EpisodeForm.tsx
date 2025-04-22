import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EPISODE, UPDATE_EPISODE } from '../graphql/queries';
import { toast } from 'react-toastify';

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
  episodeId: string | null;
  onClose: () => void;
}

const EpisodeForm: React.FC<Props> = ({ episodeId, onClose }) => {
  const { data, loading, error } = useQuery(GET_EPISODE, {
    variables: { id: episodeId },
    skip: !episodeId,
  });

  const [updateEpisode, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_EPISODE);

  const [form, setForm] = useState<FormProps>({
    series: '',
    title: '',
    description: '',
    seasonNumber: 1,
    episodeNumber: 1,
    releaseDate: '',
    imdbId: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEpisode({ variables: { id: episodeId, ...form } });
      onClose();
    } catch (err) {
      console.error("Failed to update episode", err);
      toast.error("Failed to update episode");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

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
          {episodeId ? 'Update' : 'Create'} Episode
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
