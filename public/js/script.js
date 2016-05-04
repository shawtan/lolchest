function loadPlayer() {
	var region = $('#regionSelect').val();
	var username = $('#summonerInput').val();
	username = username.replace(/ /g, '');
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;
	console.log("URL = " + url);
	$.get(url, 
		function (data, status) {
			console.log(data);
			$('#result').html(data.summoner_name + " " + data.summoner_id + ' has ' + data.has_chest.length + ' chests');
			$("#ownedChampsContainer").html(displayChamps(data.has_chest));
			$('#ownedChamps').removeClass('hidden');
			$("#recChampsContainer").html(displayChamps(data.recommended));
			$('#recChamps').removeClass('hidden');

		});
}

function displayChamps(json) {
	champs = json;
	var champHtml = "";
	for(var i = 0; i < champs.length; i++) {
		champHtml += "<li class=\"champion_port\" id=\"port_" + champs[i].id + "\" title=\"" + champs[i].name + "\"" + "onclick=\"champClicked(" + champs[i].id + ")\"" + " data-keywords=\"" + champs[i].name.toLowerCase() + "\"><img src=\"http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/" + champs[i].image.full + "\"/></li>";
	}
	return champHtml;
}
