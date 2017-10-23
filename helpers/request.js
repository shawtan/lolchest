const request = require('request-promise');

const api_key = process.env.LOL_API_KEY;
/**
Preforms a GET request to the url specified and calls success or error with the result
**/
module.exports = (url) => {
    const options = {
        uri: url,
        qs: {
            api_key: api_key,
        },
        json: true
    };

    return request(options);
};
