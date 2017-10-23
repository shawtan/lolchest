/****** Caching Functions ******/
/* Riot limits requests to static-data to 10/hour
 * So we need to store this in a cache.
 */
const request = require('./request');

const STATIC_CACHE = {};
const TIMEOUT_TIME = 3600000; // 1 hour

const getStaticData = (region) => {
    const NOW = new Date().getTime();

    if (region in STATIC_CACHE) {
        const cache = STATIC_CACHE[region];

        if (cache.cached_time < NOW + TIMEOUT_TIME) {
            return Promise.resolve(cache);
        }
    }

    console.log('Refreshing cache for', region); // eslint-disable-line no-console
    STATIC_CACHE[region] = {cached_time: NOW};

    return Promise.all([getChampions(region), getVersion(region)])
        .then(() => STATIC_CACHE[region]);
};

const getChampions = (region) => {
    const url = `https://${region}.api.riotgames.com/lol/static-data/v3/champions?tags=image&dataById=false`;

    return request(url).then(response => (STATIC_CACHE[region].champions = response.data));
};

const getVersion = (region) => {
    const url = `https://${region}.api.riotgames.com/lol/static-data/v3/versions`;

    return request(url).then(versions => (STATIC_CACHE[region].version = versions[0]));
};

module.exports = {getStaticData};
