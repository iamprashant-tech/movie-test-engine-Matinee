// Built-in sample catalogue so the app can always be demonstrated, even offline
// or when an API is blocked. Titles, years and genres are real; no posters or scores.
const RAW = [
  ['The Shawshank Redemption', 1994, ['Drama'], 'A banker jailed for a crime he says he did not commit builds an unlikely friendship inside prison.'],
  ['The Godfather', 1972, ['Crime', 'Drama'], 'The aging head of a crime family hands control to his reluctant youngest son.'],
  ['The Dark Knight', 2008, ['Action', 'Crime', 'Drama'], 'Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos.'],
  ['Pulp Fiction', 1994, ['Crime', 'Drama'], 'Intertwined stories of hitmen, a boxer and a gangster’s wife in Los Angeles.'],
  ['Inception', 2010, ['Action', 'Science Fiction', 'Adventure'], 'A thief who steals secrets from dreams is given the task of planting an idea instead.'],
  ['The Matrix', 1999, ['Action', 'Science Fiction'], 'A hacker discovers that reality is a simulation and joins a rebellion against its machines.'],
  ['Interstellar', 2014, ['Adventure', 'Drama', 'Science Fiction'], 'Explorers travel through a wormhole in search of a new home for humanity.'],
  ['Spirited Away', 2001, ['Animation', 'Fantasy', 'Adventure'], 'A girl wanders into a world of spirits and must work in a bathhouse to free her parents.'],
  ['Parasite', 2019, ['Comedy', 'Thriller', 'Drama'], 'A poor family schemes its way into the household of a wealthy one, with unexpected consequences.'],
  ['Toy Story', 1995, ['Animation', 'Comedy', 'Family'], 'A cowboy doll feels threatened when a new space ranger toy arrives in the nursery.'],
  ['The Lion King', 1994, ['Animation', 'Family', 'Drama'], 'A young lion prince flees his kingdom, then returns to take back his place.'],
  ['Forrest Gump', 1994, ['Comedy', 'Drama', 'Romance'], 'A kind-hearted man drifts through several decades of American history.'],
  ['Gladiator', 2000, ['Action', 'Adventure', 'Drama'], 'A betrayed Roman general returns as a gladiator seeking revenge.'],
  ['Mad Max: Fury Road', 2015, ['Action', 'Adventure', 'Science Fiction'], 'In a desert wasteland, a drifter and a rebel driver race to escape a tyrant.'],
  ['Get Out', 2017, ['Horror', 'Mystery', 'Thriller'], 'A young man visiting his girlfriend’s family uncovers a disturbing secret.'],
  ['The Conjuring', 2013, ['Horror', 'Thriller'], 'Paranormal investigators help a family terrorized by a dark presence in their farmhouse.'],
  ['Superbad', 2007, ['Comedy'], 'Two high-school friends try to make the most of their last days before graduation.'],
  ['La La Land', 2016, ['Comedy', 'Drama', 'Romance', 'Music'], 'A jazz musician and an aspiring actress chase their dreams in Los Angeles.'],
  ['Your Name', 2016, ['Animation', 'Romance', 'Drama', 'Fantasy'], 'Two teenagers who have never met begin swapping bodies.'],
  ['Jurassic Park', 1993, ['Adventure', 'Science Fiction', 'Action'], 'A theme park of cloned dinosaurs turns dangerous when its security fails.'],
  ['Titanic', 1997, ['Drama', 'Romance'], 'A young couple from different classes fall in love aboard the doomed ocean liner.'],
  ['Se7en', 1995, ['Crime', 'Mystery', 'Thriller'], 'Two detectives hunt a killer who bases his crimes on the seven deadly sins.'],
  ['Coco', 2017, ['Animation', 'Family', 'Fantasy', 'Music'], 'A boy who dreams of being a musician travels to the Land of the Dead.'],
  ['3 Idiots', 2009, ['Comedy', 'Drama'], 'Three engineering students navigate friendship and pressure at a top college.'],
  ['Dangal', 2016, ['Drama', 'Action'], 'A former wrestler trains his daughters to become world-class competitors.'],
  ['Knives Out', 2019, ['Comedy', 'Crime', 'Mystery'], 'A detective investigates the death of a wealthy novelist surrounded by his family.'],
  ['Whiplash', 2014, ['Drama', 'Music'], 'A young drummer is pushed to his limits by an unforgiving conductor.'],
  ['Spider-Man: Into the Spider-Verse', 2018, ['Animation', 'Action', 'Adventure', 'Science Fiction'], 'Teenager Miles Morales meets other Spider-People from across the multiverse.'],
];

const ALL = RAW.map(([title, year, genres, overview], i) => ({
  key: `demo:${i + 1}`,
  source: 'demo',
  id: String(i + 1),
  title,
  subtitle: '',
  year,
  poster: null,
  backdrop: null,
  rating: null,
  overview,
  genres,
  runtime: null,
}));

const PAGE = 12;

export async function genres() {
  return [...new Set(ALL.flatMap((m) => m.genres))].sort().map((name) => ({ id: name, name }));
}

export async function list({ page = 1, query = '', genreId = '' } = {}) {
  const q = query.trim().toLowerCase();
  const found = ALL.filter(
    (m) => (!q || m.title.toLowerCase().includes(q)) && (!genreId || m.genres.includes(genreId))
  );
  const start = (page - 1) * PAGE;
  return { items: found.slice(start, start + PAGE), hasNext: start + PAGE < found.length };
}

export async function detail(id) {
  const m = ALL.find((x) => x.id === String(id));
  if (!m) {
    const err = new Error('That title could not be found.');
    err.status = 404;
    throw err;
  }
  return m;
}

export const maxSurprisePage = 3;
