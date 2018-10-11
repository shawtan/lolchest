const DEBUG = false;

// Load environment variables
require('dotenv').config({silent: !DEBUG});

const port    = process.env.PORT;

const express             = require('express');
const app                 = express();
const path                = require('path');
const request             = require('./helpers/request');
const cache               = require('./helpers/cache');


// Defined values
const rank    = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'No Rank'];
const CHAMPION_ROLES = require('./champion_roles.json');
const REGIONS = require('./regions.json');


const NUMBER_CHAMPS_TO_RECOMMEND = 6;

// Main page
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+ '/public/index.html'));
});

// API queries
app.get('/info/:region/:username/:role*?', function (req, res) {
    if (req.params.role === undefined) {
        req.params.role = 'all';
    }
    req.params.region = REGIONS[req.params.region];
    console.log('Info request for ' + req.params.username + ' in ' + req.params.region + ' for role ' + req.params.role); // eslint-disable-line no-console

    getSummonerId(req.params)
        .then(getChampionMastery)
        .then(addChampionInfo)
        .then(filterChampions)
        .then(displayData)
        .then(data => res.json(data))
        .catch(err => {
            console.log('Error:', err); // eslint-disable-line no-console
            res.json(err);
        });
});


app.listen(port, function () {
    DEBUG && console.log('App started at localhost:' + port); // eslint-disable-line no-console
});

/****** Preform additional quries to assemble information ******/
const getSummonerId = (params) => {
    const summoner_name = params.username;
    const region = params.region;
    const url = `https://${region}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${summoner_name}`;

    return request(url).then(({id, name}) =>
        ({
            ...params,
            summoner_id: id,
            summoner_name: name
        })
    );
};

const getChampionMastery = (data) => {
    const region = data.region;
    const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data['summoner_id']}`;

    return request(url).then(mastery_info =>
        ({
            ...data,
            champions: mastery_info,
            mastery_info
        })
    );
};

const addChampionInfo = (data) => {
    const region = data.region;

    return cache.getStaticData(region).then(response => {
        const champlist = response.champions;
        const champArray = [];
        for (const championInfo in champlist) {
            champArray.push(combineChampionInfo(champlist[championInfo], data.mastery_info));
        }
        data.champions = champArray;
        data.champions.sort(compareChampion);
        data.version = response.version;
        return data;
    });
};

const filterChampions = (data) => {
    data.has_chest = data.champions.filter(championHasChest);
    data.recommended = data.champions
        .filter(championHasNoChest)
        .filter(c => championRoleMatches(c, data.role))
        .slice(0, NUMBER_CHAMPS_TO_RECOMMEND);

    return data;
};


/**
Responds with the assembled information
**/
function displayData({
    summoner_name,
    summoner_id,
    has_chest,
    recommended,
    version,
}) {
    return {
        summoner_name,
        summoner_id,
        has_chest,
        recommended,
        version,
    };

}

/****** Helper Functions ******/

function combineChampionInfo({name, title, key, image, id}, championMasteryList) {
    const championMastery = championMasteryList.find(function(c) {
        return c.championId == key;
    });

    const result = {
        name,
        title,
        key,
        'champion_points'   : 0,
        image,
        'has_chest'         : false,
        id,
    };

    if (championMastery !== undefined) {
        if (championMastery.highestGrade !== undefined) {
            result.highest_grade      = championMastery.highestGrade;
        }
        if (championMastery.championPoints !== undefined) {
            result.champion_points    = championMastery.championPoints;
        }
        if (championMastery.chestGranted !== undefined) {
            result.has_chest          = championMastery.chestGranted;
        }
    }
    return result;
}

function championHasChest(championMastery) {
    return championMastery.has_chest;
}
function championHasNoChest(championMastery) {
    return !championHasChest(championMastery);
}
function championRoleMatches(champion, role) {
    return role === 'all' || (role in CHAMPION_ROLES && CHAMPION_ROLES[role].indexOf(champion.key) !== -1);
}

function compareChampion(c1, c2) {
    // return c2.champion_points - c1.champion_points;
    const score1 = c1.highest_grade;
    const score2 = c2.highest_grade;
    if (score1 === null && score2 === null || rank.indexOf(score1) === rank.indexOf(score2)) {
        // Compare mastery points
        if (c1.champion_points === c2.champion_points) {
            // Compare win rates
            return 0;
        } else {
            return c2.champion_points - c1.champion_points;
        }
    } else if (score2 === null) {
        return -1;
    } else if (score1 === null) {
        return 1;
    } else {
        return rank.indexOf(score1) - rank.indexOf(score2);
    }
}
