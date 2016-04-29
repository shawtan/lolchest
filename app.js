require('dotenv').config();
var express = require('express');
var app = express();

var https = require('https')

var api_key = process.env.LOL_API_KEY;

var rank = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'];

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/user/:username', function (req, res) {
  var username = req.params.username;
  getSummonerId(username, res)
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});


function getSummonerId(summoner_name, res) {
  https.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/'+summoner_name+'?api_key='+api_key,
    (response) => {
      console.log('statusCode: ', response.statusCode);
      // console.log('headers: ', res.headers);

      response.on('data', (d) => {
        d = JSON.parse(d);
        getChampions({
          summoner_id: d[summoner_name].id,
          summoner_name: d[summoner_name].name,
          }, res);
      });

    }).on('error', (e) => {
      console.error(e);
      res.json({error: e})
    });
}

function getChampions(data, res) {
  https.get('https://na.api.pvp.net/championmastery/location/NA1/player/'+data['summoner_id']+'/champions?api_key='+api_key,
    (response) => {
      console.log('statusCode: ', response.statusCode);
      // console.log('headers: ', res.headers);

      var champions = '';
      response.on('data', (d) => {
        champions += d;
      });

      response.on('end', () => {

        champions = JSON.parse(champions);
        addChampionInfo({
          summoner_id: data['summoner_id'],
          summoner_name: data['summoner_name'],
          champions: champions.filter(championHasChest)
          }, res);
      })

    }).on('error', (e) => {
      console.error(e);
      res.json({error: e})
    });
}

function championHasChest(championMastery) {
  return !championMastery.chestGranted;
}

function addChampionInfo(data, res) {
  https.get('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?dataById=true&api_key='+api_key,
    (response) => {
      console.log('statusCode: ', response.statusCode);
      // console.log('headers: ', res.headers);
      var champlist = '';

      response.on('data', (d) => {
        // process.stdout.write(d);
        champlist += d;
      });
      response.on('end', () => {
        champlist = JSON.parse(champlist).data;
        data.champions = data.champions.map(function(c) {return parseChampionInfo(c, champlist);});
        data.champions.sort(compareChampion);
        console.log('Champion count: ' + data.champions.length)
        res.json(data);
      });

    }).on('error', (e) => {
      console.error(e);
      res.json({error: e})
    });
}

function compareChampion(c1, c2) {
  var score1 = c1.champion_score;
  var score2 = c2.champion_score;
  if (score2 == null) return -1;
  if (score1 == null) return 1;
  return rank.indexOf(score1) - rank.indexOf(score2);

}


function parseChampionInfo(championMastery, championList) {
  // return championMastery;
  // return championList[championMastery.championId+''].name;
  return {
    'champion_name': championList[championMastery.championId+''].name,
    'champion_title': championList[championMastery.championId].title,
    'champion_score': championMastery.highestGrade
  };
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
