function loadPlayer() {
	clearPage();

	var region = $('#regionSelect').val();
	var username = $('#summonerName').val();
	username = username.replace(/ /g, '');
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;
	console.log("URL = " + url);
	$.get(url, 
		function (data, status) {
			console.log(data);

			if (data.error != undefined) {
				console.log('error = ' + data.error);
				$('#formError').html('An error has occured. ('+data.error+')');
				$('#formError').removeClass('hidden');
				return;	
			}

			$('#formError').addClass('hidden');

			$("#ownedChampsContainer").html(displayChamps(data.has_chest, false));
			$('#ownedChamps').removeClass('hidden');
			$("#recChampsContainer").html(displayChamps(data.recommended, true));
			$('#recChamps').removeClass('hidden');
			$('html,body').animate({
			   scrollTop: $(".results").offset().top
			});
		});
}

function displaySplash(champ) {
	var url = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.key+"_0.jpg";
	var champHtml = "<img src=\""+url+"\">"
		+ "<div><span class=\"championName\">"+champ.name+"</span><br>"
		+ "Your Best Rank: "+champ.highest_grade+"<br>Mastery Points: "+champ.champion_points+"</span>"
		+"</div>";
	$('.championSplash').html(champHtml);
}

function displayChamps(json, showSplash) {
	champs = json;
	if (champs.length == 0) {
		return "<div>We couldn't find any data. Sorry!</div>";
	}

	var champHtml = "";
	for(var i = 0; i < champs.length; i++) {
		if (showSplash && i==0) {
			displaySplash(champs[i]);
		} else {
		champHtml += "<li class=\"championPortrait\" title=\"" + champs[i].name + "\">"
			+ "<img src=\"http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/" + champs[i].image.full + "\"/>"
			+ "<span class=\"championGrade\"><span>"+champs[i].highest_grade + (showSplash?("<br>" + champs[i].champion_points):"")+"</span></span>"
			+ "</li>";
		}
	}
	return champHtml;
}

function clearPage() {
	var blank = '';

	$('#formError').addClass('hidden');

	$("#ownedChampsContainer").html(blank);
	$("#recChampsContainer").html(blank);
	$('.championSplash').html(blank);
	$('#ownedChamps').addClass('hidden');
	$('#recChamps').addClass('hidden');

}
