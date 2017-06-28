var express       = require('express');
var app           = express();
var path          = require("path");
var https         = require('https');

// Load environment variables
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}
var api_key = process.env.LOL_API_KEY;
var port    = process.env.PORT;

// Defined values
var rank  = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'No Rank'];
var roles = ['top', 'jungle', 'mid', 'bot', 'support'];
var championRoles = require('./champion_roles.json');
var regions = require('./regions.json');

var NUMBER_CHAMPS_TO_RECOMMEND = 6;
var DEBUG = false;

// Main page
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+ '/public/index.html'));
});

// API queries
app.post('/info/:region/:username/:role*?', function (req, res) {
  // res.header('Access-Control-Allow-Origin', '*');
  if (req.params.role == undefined) {
    req.params.role = 'all';
  }
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

      var data = '';

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
  var summoner_name = params.username;
  var region = params.region;
  var url = 'https://'+region+'.api.pvp.net/api/lol/'+region+'/v1.4/summoner/by-name/'+summoner_name+'?api_key='+api_key;
  makeRequest(url,
    (data) => {
        data = JSON.parse(data);
        for (var user in data) {
          getChampionMastery({
            params: params,
            summoner_id: data[user].id,
            summoner_name: data[user].name,
            }, res);
          break;
        }
    },
    (error) => {
      res.json(error);
    });
}

function getChampionMastery(data, res) {
  var region = data.params.region;
  var url = 'https://'+region+'.api.pvp.net/championmastery/location/'+regions[region]+'/player/'+data['summoner_id']+'/champions?api_key='+api_key;
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
  var region = data.params.region.toLowerCase();
  url = 'https://global.api.pvp.net/api/lol/static-data/'+region+'/v1.2/champion?dataById=false&champData=image&api_key='+api_key;
  makeRequest(url,
    (champlist) => {
        champlist = JSON.parse(champlist).data;
        var champArray = [];
        for (var championInfo in champlist) {
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
  var region = data.params.region;
  var url = 'https://global.api.pvp.net/api/lol/static-data/'+region+'/v1.2/versions?api_key='+api_key;

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
  var championMastery = championMasteryList.find(function(c) {
    return c.championId == championInfo.id;
  });

  var result = {
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
  var score1 = c1.highest_grade;
  var score2 = c2.highest_grade;
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

/*
{"cookiesncream": {
   "id": 38053912,
   "name": "Cookies n Cream",
   "profileIconId": 983,
   "revisionDate": 1461717780000,
   "summonerLevel": 30
}}
*/
