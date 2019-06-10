const request = require('request-promise');

const api_key = process.env.LOL_API_KEY;

const prettifyError = ({error, options}) => {
	return {
		error,
		options
	}
}

/**
Preforms a GET request to the url specified and calls success or error with the result
**/
module.exports = (url) => {
    const options = {
        uri: url,
        json: true,
        headers: {
            'X-Riot-Token': api_key,
        }
    };

    return request(options).catch(err => {
        throw prettifyError(err)
    });
};
