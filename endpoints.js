const fetch = require('isomorphic-fetch');
const { stringify } = require('query-string');


// TODO: move to ENV variable
const STEAM_API_KEY = 'AF3052C6CAE9D1DDD5A4FF9A079A3641';

const ROOT_URL = 'http://api.steampowered.com';

/**
 * Generic function that processes a GET call and returns the resolved JSON object.
 * @param {string} url
 * @param {Object} query Query params
 */
const get = (url, query) => {
  const queryParams = stringify({
    format: 'json',
    key: STEAM_API_KEY,
    ...query,
  });

  return fetch(`${url}?${queryParams}`)
    .then(response => {
      // Here we check if the request failed. If yes, we'll forward a custom error payload
      // so we can react approprately.
      if (!response.ok) {
        return { response: { error: true } };
      }
      return response.json();
    })
    .then(({ response }) => response);
};

/**
 * Returns Steam player's list of owned games.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerOwnedGames = (steamId) =>
  get(`${ROOT_URL}/IPlayerService/GetOwnedGames/v0001`, {
    steamid: steamId,
    include_played_free_games: true,
    include_appinfo: true,
  });

/**
 * Returns Steam player's list of owned games.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerProfile = (steamId) =>
  get(`${ROOT_URL}/ISteamUser/GetPlayerSummaries/v0002`, { steamIds: steamId });

/**
 * Returns Steam player's list of recently played games (2 weeks).
 * @param {string} url
 * @param {Object} query Query params
 */
const getRecentGames = (steamId) =>
  get(`${ROOT_URL}/IPlayerService/GetRecentlyPlayedGames/v0001`, { steamid: steamId });

/**
 * Combines player profile data, owned games and recent games in one object.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerById = (req, res) => {
  Promise.all([
    getPlayerProfile(req.params.steamId),
    getPlayerOwnedGames(req.params.steamId),
    getRecentGames(req.params.steamId),
  ])
  .then((responses) => {
    // If we get a fetch error from any call
    if (responses.some(r => r.error )) {
      res.status(500).send({ error: true });
      return;
    }

    const [{ players }, ownedGames, recentGames] = responses;
    res.send({
      ...players[0],
      games: ownedGames.games ? ownedGames : null, // check for players with private game data
      recentGames: recentGames.games ? recentGames : null, // check for players with private game data
    });
  })
  .catch(error => { console.error(error); });
}


module.exports = {
  getPlayerById,
  getPlayerOwnedGames,
};
