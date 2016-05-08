
var querying = false; 	// Prevents users spamming the search button
function loadPlayer() {
	if (querying) return;

	clearPage();

	var region = $('#regionSelect').val();
	var username = $('#summonerName').val();
	username = username.replace(/ /g, '');
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;
	querying = true;
	$.get(url, 
		function (data, status) {
			querying = false;
			if (data.error != undefined) {
				$('#formError').html('An error has occured. ' + clarifyError(data.error));
				$('#formError').removeClass('hidden');
				return;	
			}

			$('#formError').addClass('hidden');

			$("#recChampsContainer").html(displayChamps(data.recommended, true));
			$("#ownedChampsContainer").html(displayChamps(data.has_chest, false));

			$('#recChamps').fadeIn('slow');
			$('#ownedChamps').fadeIn(800);

			$('#recChamps').removeClass('hidden');
			$('#ownedChamps').removeClass('hidden');

			$('html,body').animate({
			   scrollTop: $(".results").offset().top
			});
		});
}

function clarifyError(error) {
	console.log('Request to Riot servers has encountered error ' + error);
	if (error.indexOf('404') !== -1) {
		return 'Summoner not found!';
	} else if (error.indexOf('500') !== -1) {
		return 'Something bad happened!';
	} else if (error.indexOf('429') !== -1) {
		return 'Please try again later.';
	}
	return "";
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
		champHtml += "<div class=\"championPortrait\" title=\"" + champs[i].name + "\">"
			+ "<img src=\"http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/" + champs[i].image.full + "\"/>"
			+ "<span class=\"championGrade\">"+champs[i].highest_grade + (showSplash?("<br>" + champs[i].champion_points):"")+"</span>"
			+ (showSplash?"<span class=\"championName\">"+champs[i].name+"</span>":"")
			+ "</div>";
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
