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
    .then(response => response.json())
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
  });

/**
 * Returns Steam player's list of owned games.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerProfile = (steamId) =>
  get(`${ROOT_URL}/ISteamUser/GetPlayerSummaries/v0002`, { steamIds: steamId });

/**
 * Returns Steam player payload from steamID.
 * Also fetches list of owned games and attach it to the player object.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerById = (req, res) => {

  return Promise.all([
    getPlayerProfile(req.params.steamId),
    getPlayerOwnedGames(req.params.steamId),
  ])
    .then(([{ players }, games]) => res.send({
      ...players[0],
      games: games.games ? games : null, // check for players with private game data
    }))
    .catch(error => { console.error(error); });
}


module.exports = {
  getPlayerById,
  getPlayerOwnedGames,
};
