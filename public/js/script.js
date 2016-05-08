function loadPlayer() {
	var region = $('#regionSelect').val();
	var username = $('#summonerName').val();
	username = username.replace(/ /g, '');
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;
	console.log("URL = " + url);
	$.get(url, 
		function (data, status) {
			console.log(data);
			$('#result').html(data.summoner_name + " " + data.summoner_id + ' has ' + data.has_chest.length + ' chests');
			$("#ownedChampsContainer").html(displayChamps(data.has_chest, false));
			$('#ownedChamps').removeClass('hidden');
			$("#recChampsContainer").html(displayChamps(data.recommended, true));
			$('#recChamps').removeClass('hidden');

		});
}

function displaySplash(champ) {
	var url = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.key+"_0.jpg";
}

function displayChamps(json, showPoints) {
	champs = json;
	var champHtml = "";
	for(var i = 0; i < champs.length; i++) {
		champHtml += "<li class=\"championPortrait\" title=\"" + champs[i].name + "\">"
			+ "<img src=\"http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/" + champs[i].image.full + "\"/>"
			+ "	<span class=\"championGrade\"><span>"+champs[i].highest_grade + (showPoints?("<br>" + champs[i].champion_points):"")+"</span></span>"
			+ "</li>";
	}
	return champHtml;
}
