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
 * Returns Steam player payload from steamID.
 * @param {string} url
 * @param {Object} query Query params
 */
const getPlayerById = (req, res) => {
  const query = {
    steamIds: req.params.playerId.split(',')[0],
  };

  return get(`${ROOT_URL}/ISteamUser/GetPlayerSummaries/v0002`, query)
    .then(response => res.send(response.players[0]))
    .catch(error => { console.error(error); });
}


module.exports = {
  getPlayerById,
}
