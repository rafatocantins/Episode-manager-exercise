// Mock data for episodes when GraphQL API is unavailable

export interface MockEpisode {
  id: string;
  series: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  description: string;
  releaseDate: string;
  imdbId: string;
}

export let mockEpisodes: MockEpisode[] = [
  {
    id: '1',
    series: 'Stranger Things',
    title: 'The Vanishing of Will Byers',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '2',
    series: 'Stranger Things',
    title: 'The Weirdo on Maple Street',
    seasonNumber: 1,
    episodeNumber: 2,
    description: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '3',
    series: 'Stranger Things',
    title: 'Holly, Jolly',
    seasonNumber: 1,
    episodeNumber: 3,
    description: 'An increasingly concerned Nancy looks for Barb and finds out what Jonathan\'s been up to. Joyce is convinced Will is trying to talk to her.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '4',
    series: 'Stranger Things',
    title: 'The Body',
    seasonNumber: 1,
    episodeNumber: 4,
    description: 'Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover. Nancy and Jonathan form an unlikely alliance.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '5',
    series: 'Stranger Things',
    title: 'The Flea and the Acrobat',
    seasonNumber: 1,
    episodeNumber: 5,
    description: 'Hopper breaks into the lab while Nancy and Jonathan confront the force that took Will. The boys ask Mr. Clarke how to travel to another dimension.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '6',
    series: 'Stranger Things',
    title: 'The Monster',
    seasonNumber: 1,
    episodeNumber: 6,
    description: 'A frantic Jonathan looks for Nancy in the darkness, but Steve\'s looking for her too. Hopper and Joyce uncover the truth about the lab\'s experiments.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '7',
    series: 'Stranger Things',
    title: 'The Bathtub',
    seasonNumber: 1,
    episodeNumber: 7,
    description: 'Eleven struggles to reach Will, while Lucas warns that "the bad men are coming." Nancy and Jonathan show the police what Jonathan caught on camera.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '8',
    series: 'Stranger Things',
    title: 'The Upside Down',
    seasonNumber: 1,
    episodeNumber: 8,
    description: 'Dr. Brenner holds Hopper and Joyce for questioning while the boys wait with Eleven in the gym. Back at Will\'s, Nancy and Jonathan prepare for battle.',
    releaseDate: '2016-07-15',
    imdbId: 'tt4574334'
  },
  {
    id: '9',
    series: 'Stranger Things',
    title: 'MADMAX',
    seasonNumber: 2,
    episodeNumber: 1,
    description: 'As the town preps for Halloween, a high-scoring rival shakes things up at the arcade, and a skeptical Hopper inspects a field of rotting pumpkins.',
    releaseDate: '2017-10-27',
    imdbId: 'tt4574334'
  },
  {
    id: '10',
    series: 'Stranger Things',
    title: 'Trick or Treat, Freak',
    seasonNumber: 2,
    episodeNumber: 2,
    description: 'After Will sees something terrible on trick-or-treat night, Mike wonders whether Eleven\'s still out there. Nancy wrestles with the truth about Barb.',
    releaseDate: '2017-10-27',
    imdbId: 'tt4574334'
  },
  {
    id: '11',
    series: 'Breaking Bad',
    title: 'Pilot',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    releaseDate: '2008-01-20',
    imdbId: 'tt0903747'
  },
  {
    id: '12',
    series: 'Breaking Bad',
    title: 'Cat\'s in the Bag...',
    seasonNumber: 1,
    episodeNumber: 2,
    description: 'Walt and Jesse clean up after their first cook, but disposing of a body proves to be more difficult than expected.',
    releaseDate: '2008-01-27',
    imdbId: 'tt0903747'
  },
  {
    id: '13',
    series: 'The Sopranos',
    title: 'Pilot',
    seasonNumber: 1,
    episodeNumber: 1,
    description: 'Tony Soprano, a New Jersey mob boss, seeks psychiatric counseling to cope with work-related stress and family issues.',
    releaseDate: '1999-01-10',
    imdbId: 'tt0141842'
  },
  {
    id: '14',
    series: 'The Sopranos',
    title: '46 Long',
    seasonNumber: 1,
    episodeNumber: 2,
    description: 'While Tony deals with panic attacks, his nephew Christopher makes his bones by killing a made man.',
    releaseDate: '1999-01-17',
    imdbId: 'tt0141842'
  }
];

export const getSeasons = (series: string): number[] => {
  const seasons = [...new Set(mockEpisodes
    .filter(ep => series ? ep.series === series : true)
    .map(ep => ep.seasonNumber))];
  return seasons.sort((a, b) => a - b);
};

export const getEpisodeById = (id: string): MockEpisode | undefined => {
  return mockEpisodes.find(ep => ep.id === id);
};

export const listEpisodes = (search: string = '', series: string = ''): MockEpisode[] => {
  return mockEpisodes.filter(ep => {
    const matchesSearch = search
      ? ep.title.toLowerCase().includes(search.toLowerCase()) ||
        ep.series.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesSeries = series ? ep.series === series : true;
    return matchesSearch && matchesSeries;
  });
};

export const getSeriesList = (): string[] => {
  const seriesList = [...new Set(mockEpisodes.map(ep => ep.series))];
  return seriesList.sort();
};

export const deleteEpisodeById = (id: string): boolean => {
  const initialLength = mockEpisodes.length;
  mockEpisodes = mockEpisodes.filter(ep => ep.id !== id);
  return mockEpisodes.length < initialLength; // Returns true if an episode was deleted
};

export const updateEpisodeById = (id: string, updatedData: Partial<MockEpisode>): boolean => {
  const episodeIndex = mockEpisodes.findIndex(ep => ep.id === id);
  if (episodeIndex === -1) return false;
  
  // Update only the fields that are provided
  mockEpisodes[episodeIndex] = {
    ...mockEpisodes[episodeIndex],
    ...updatedData
  };
  
  return true; // Return true to indicate successful update
};
