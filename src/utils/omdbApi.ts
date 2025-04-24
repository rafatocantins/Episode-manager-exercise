// OMDB API utility functions
const API_KEY = process.env.REACT_APP_OMDB_API_KEY || '41d28581'; // in case of no env variable, use a default key for testing
const BASE_URL = process.env.REACT_APP_OMDB_BASE_URL || 'http://www.omdbapi.com'; // in case of no env variable, use a default URL for testing

export interface OmdbShowData {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  totalSeasons?: string;
  Response: string;
  Season?: string;
  Episode?: string;
}

export interface SearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
}

export interface Season {
  seasonNumber: number;
}

export interface Episode {
  Title: string;
  imdbID: string;
  Plot: string;
  Released: string;
  Season: string;
  episodeNumber: string;
}

export const fetchShowData = async (title: string): Promise<OmdbShowData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch show data');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch show data');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching show data:', error);
    throw error;
  }
};

export const fetchEpisodeData = async (
  imdbID: string, 
  season: number, 
  episode: number
): Promise<OmdbShowData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/?i=${imdbID}&Season=${season}&Episode=${episode}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch episode data');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Failed to fetch episode data');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching episode data:', error);
    throw error;
  }
};

export const searchShow = async (showName: string): Promise<OmdbShowData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/?s=${encodeURIComponent(showName)}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch show data');
    }

    const data = await response.json();

    if (data.Response === 'False') {
      return [];
    }

    return data.Search || [];
  } catch (error) {
    console.error('Error fetching show data:', error);
    return [];
  }
};

// Popular shows with their IMDB IDs
export const popularShows = [
  { title: 'Stranger Things', imdbID: 'tt4574334' },
  { title: 'The Crown', imdbID: 'tt4786824' },
  { title: 'Bridgerton', imdbID: 'tt8740790' },
  { title: 'Squid Game', imdbID: 'tt10919420' },
  { title: 'Dark', imdbID: 'tt5753856' },
  { title: 'Money Heist', imdbID: 'tt6468322' }
];

// Predefined popular episodes for each show
export const popularEpisodes = [
  { showTitle: 'Stranger Things', imdbID: 'tt4574334', season: 1, episode: 1, title: 'The Vanishing of Will Byers' },
  { showTitle: 'Stranger Things', imdbID: 'tt4574334', season: 1, episode: 8, title: 'The Upside Down' },
  { showTitle: 'The Crown', imdbID: 'tt4786824', season: 1, episode: 1, title: 'Wolferton Splash' },
  { showTitle: 'The Crown', imdbID: 'tt4786824', season: 2, episode: 1, title: 'Misadventure' },
  { showTitle: 'Bridgerton', imdbID: 'tt8740790', season: 1, episode: 1, title: 'Diamond of the First Water' },
  { showTitle: 'Bridgerton', imdbID: 'tt8740790', season: 1, episode: 5, title: 'The Duke and I' },
  { showTitle: 'Squid Game', imdbID: 'tt10919420', season: 1, episode: 1, title: 'Red Light, Green Light' },
  { showTitle: 'Squid Game', imdbID: 'tt10919420', season: 1, episode: 6, title: 'Gganbu' },
  { showTitle: 'Dark', imdbID: 'tt5753856', season: 1, episode: 1, title: 'Secrets' },
  { showTitle: 'Dark', imdbID: 'tt5753856', season: 2, episode: 1, title: 'Beginnings and Endings' },
  { showTitle: 'Money Heist', imdbID: 'tt6468322', season: 1, episode: 1, title: 'Efectuar lo acordado' },
  { showTitle: 'Money Heist', imdbID: 'tt6468322', season: 2, episode: 1, title: 'Se acabaron las máscaras' }
];

export const getEpisodeData = async (
  showTitle: string,
  season: number,
  episode: number
): Promise<OmdbShowData> => {
  try {
    const popularShow = popularShows.find((show) => show.title === showTitle);

    let imdbID: string | undefined;

    if (popularShow) {
      imdbID = popularShow.imdbID;
    } else {
      const showData = await fetchShowData(showTitle);
      imdbID = showData.imdbID;
    }

    if (!imdbID) {
      throw new Error('Could not find imdbID for show');
    }

    const episodeData = await fetchEpisodeData(imdbID, season, episode);
    return episodeData;
  } catch (error) {
    console.error('Error getting episode data:', error);
    throw error;
  }
};

export const fetchSeasons = async (show: SearchResult): Promise<Season[]> => {
  let seasonNumber = 1;
  const availableSeasons: Season[] = [];

  while (true) {
    try {
      const response = await fetch(
        `${BASE_URL}/?t=${encodeURIComponent(show.Title)}&Season=${seasonNumber}&apikey=${API_KEY}`
      );
      const data = await response.json();

      if (data.Response === 'False') {
        break;
      }

      availableSeasons.push({ seasonNumber });
      seasonNumber++;
    } catch (error) {
      console.error('Error fetching seasons:', error);
      break;
    }
  }

  return availableSeasons;
};

export const fetchEpisodesForSeason = async (show: SearchResult, seasonNumber: number): Promise<Episode[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/?t=${encodeURIComponent(show.Title)}&Season=${seasonNumber}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === 'False' || !data.Episodes) {
      return [];
    }

    const episodesWithDetails: Episode[] = await Promise.all(
      data.Episodes.map(async (episode: any) => {
        const episodeDetails = await fetchEpisodeDetails(episode.imdbID);
        return {
          Title: episode.Title,
          imdbID: episode.imdbID,
          Plot: episodeDetails?.Plot || '',
          Released: episodeDetails?.Released || '',
          Season: episodeDetails?.Season || '',
          episodeNumber: episode.Episode,
        };
      })
    );

    return episodesWithDetails;
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
};

export const fetchEpisodeDetails = async (imdbID: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/?i=${imdbID}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.Response === 'False') {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching episode details:', error);
    return null;
  }
};
