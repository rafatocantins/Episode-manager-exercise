import { gql } from '@apollo/client';

export const LIST_EPISODES = gql`
  query ListEpisodes($search: String, $series: String) {
    listEpisodes(search: $search, series: $series) {
      id
      series
      title
      seasonNumber
      episodeNumber
    }
  }
`;

export const GET_EPISODE = gql`
  query GetEpisode($id: String!) {
    getEpisodeById(id: $id) {
      id
      series
      title
      description
      seasonNumber
      episodeNumber
      releaseDate
      imdbId
    }
  }
`;

export const CREATE_EPISODE = gql`
  mutation CreateEpisode($input: EpisodeInput!) {
    createEpisode(input: $input) {
      id
    }
  }
`;

export const UPDATE_EPISODE = gql`
  mutation UpdateEpisode($input: UpdateEpisodeInput!) {
    updateEpisode(input: $input) {
      id
    }
  }
`;

export const DELETE_EPISODE = gql`
  mutation DeleteEpisode($id: String!) {
    deleteEpisode(id: $id)
  }
`;

export const ON_CREATE = gql`
  subscription OnCreateEpisode {
    onCreateEpisode {
      id
      series
      title
    }
  }
`;

export const ON_DELETE = gql`
  subscription OnDeleteEpisode {
    onDeleteEpisode
  }
`;

export const ON_UPDATE = gql`
  subscription OnUpdateEpisode {
    onUpdateEpisode {
      id
      series
      title
    }
  }
`;

export const GET_SEASONS = gql`
  query GetSeasons($series: String!) {
    getSeasons(series: $series) {
      seasonNumber
    }
  }
`;
