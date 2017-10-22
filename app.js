const express       = require('express');
const app           = express();
const path          = require("path");
const https         = require('https');

// Load environment variables
require('dotenv').config();
const api_key = process.env.LOL_API_KEY;
const port    = process.env.PORT;

// Defined values
const rank  = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'No Rank'];
const roles = ['top', 'jungle', 'mid', 'bot', 'support'];
const championRoles = require('./champion_roles.json');
const regions = require('./regions.json');

const NUMBER_CHAMPS_TO_RECOMMEND = 6;
const DEBUG = false;

// Main page
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+ '/public/index.html'));
});

// API queries
app.get('/info/:region/:username/:role*?', function (req, res) {
  if (req.params.role == undefined) {
    req.params.role = 'all';
  }
  req.params.region = regions[req.params.region];
  console.log('Info request for ' + req.params.username + ' in ' + req.params.region + ' for role ' + req.params.role);
  getSummonerId(req.params, res);
})


app.listen(port, function () {
  console.log('App started at localhost:' + port);
});

/**
Preforms a GET request to the url specified and calls success or error with the result
**/
function makeRequest(url, success, error) {
  // console.log(url);
  https.get(url,
    (response) => {
      // console.log('statusCode: ', response.statusCode);
      // console.log('headers: ', res.headers);
      if (response.statusCode != 200) {
        console.log('Error: ' + response.statusCode);
        error({"error" : "status code " + response.statusCode});
        return;
      }

      let data = '';

      response.on('data', (d) => {
        data += d;
      });

      response.on('end', () => {
        success(data);
      });

    }).on('error', (e) => {
      console.log('Error: ' + e);
      error({"error" : e});
    });
}


/****** Preform additional quries to assemble information ******/

function getSummonerId(params, res) {
  const summoner_name = params.username;
  const region = params.region;
  const url = `https://${region}.api.riotgames.com/lol/summoner/v3/summoners/by-name/${summoner_name}?api_key=${api_key}`

  makeRequest(url,
    (data) => {
        data = JSON.parse(data);
        const {id, name} = data;
        for (const user in data) {
          getChampionMastery({
            params,
            summoner_id: id,
            summoner_name: name
            }, res);
          break;
        }
    },
    (error) => {
      res.json(error);
    });
}

function getChampionMastery(data, res) {
  const region = data.params.region;
  const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data['summoner_id']}?api_key=${api_key}`;

    makeRequest(url,
    (mastery_info) => {
        mastery_info = JSON.parse(mastery_info);
        addChampionInfo({
          params: data.params,
          summoner_id: data['summoner_id'],
          summoner_name: data['summoner_name'],
          champions: mastery_info,
          mastery_info: mastery_info,
        }, res);
    },
    (error) => {
      res.json(error);
    });
}

function addChampionInfo(data, res) {
  const region = data.params.region.toLowerCase();
  const url = `https://${region}.api.riotgames.com/lol/static-data/v3/champions?tags=image&dataById=false&api_key=${api_key}`

  makeRequest(url,
    (champlist) => {
        champlist = JSON.parse(champlist).data;
        const champArray = [];
        for (const championInfo in champlist) {
          champArray.push(combineChampionInfo(champlist[championInfo],data.mastery_info));
        }
        data.champions = champArray;
        data.champions.sort(compareChampion);
        getVersion(data, res);
    },
    (error) => {
      res.json(error);
    });
}

function getVersion(data, res) {
  const region = data.params.region;
  const url = `https://${region}.api.riotgames.com/lol/static-data/v3/versions?api_key=${api_key}`

  makeRequest(url,
    (versions) => {
        versions = JSON.parse(versions);
        data.version = versions[0];
        filterChamptions(data, res);
    },
    (error) => {
      res.json(error);
    });
}

function filterChamptions(data, res) {
  data.has_chest = data.champions.filter(championHasChest);
  data.recommended = data.champions.filter(championHasNoChest).filter(function(c) {return championRoleMatches(c, data.params.role);}).slice(0,NUMBER_CHAMPS_TO_RECOMMEND);
  displayData(data, res);
}


/**
Responds with the assembled information
**/
function displayData(data, res) {
  if (DEBUG) {
    data.has_chest = data.has_chest.map(function (c) {return [c.name, c.highest_grade, c.champion_points]});
    data.recommended = data.recommended.map(function (c) {return [c.name, c.highest_grade, c.champion_points]});
  }
  res.json({
    "summoner_name":  data.summoner_name,
    "summoner_id":    data.summoner_id,
    "has_chest":      data.has_chest,
    "recommended":    data.recommended,
    "version":        data.version,
  })

}

/****** Helper Functions ******/

function combineChampionInfo(championInfo, championMasteryList) {
  const championMastery = championMasteryList.find(function(c) {
    return c.championId == championInfo.id;
  });

  const result = {
      'name'          : championInfo.name,
      'title'         : championInfo.title,
      'key'           : championInfo.key,
      'highest_grade' : "No Rank",
      'champion_points': 0,
      'image'         : championInfo.image,
      'has_chest'     : false,
      'id'            : championInfo.id
    };

  if (championMastery != undefined) {
    if (championMastery.highestGrade !== undefined) {
      result.highest_grade    = championMastery.highestGrade;
    }
    if (championMastery.championPoints != undefined) {
      result.champion_points  = championMastery.championPoints;
    }
    if (championMastery.chestGranted != undefined) {
      result.has_chest        = championMastery.chestGranted;
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
  return role == 'all' || (role in championRoles && championRoles[role].indexOf(champion.key) != -1);
}

function compareChampion(c1, c2) {
  // return c2.champion_points - c1.champion_points;
  const score1 = c1.highest_grade;
  const score2 = c2.highest_grade;
  if (score1 == null && score2 == null || rank.indexOf(score1) == rank.indexOf(score2)) {
    // Compare mastery points
    if (c1.champion_points == c2.champion_points) {
      // Compare win rates
      return 0;
    } else {
      return c2.champion_points - c1.champion_points;
    }
  } else if (score2 == null) {
    return -1;
  } else if (score1 == null) {
    return 1;
  } else {
    return rank.indexOf(score1) - rank.indexOf(score2);
  }
}
