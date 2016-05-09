
var querying = false; 	// Prevents users spamming the search button
function loadPlayer() {
	if (querying) return;

	clearPage();

	var region = $('#regionSelect').val();
	var username = $('#summonerName').val();
	username = encodeURIComponent(username.replace(/ /g, ''));
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;
	// $.get(url, 
	$.ajax({
		type: "post",
		url: url,
	    beforeSend: function() {	
	    	querying = true;
	    	$('#submitButton').addClass('m-progress');
	    },
		success: function (data) {
			// querying = false;
			if (data.error != undefined) {
				showError(clarifyError(data.error));
				return;	
			}

			$('#formError').addClass('hidden');

			var showRec = (data.recommended.length > 0);
			var showOwned = (data.has_chest.length > 0);

			if (showRec) {
				$("#recChampsContainer").html(displayChamps(data.recommended, true));
				$('#recChamps').fadeIn('slow');
				$('#recChamps').removeClass('hidden');
			}
			if (showOwned) {
				$("#ownedChampsContainer").html(displayChamps(data.has_chest, false));
				$('#ownedChamps').fadeIn(800);
				$('#ownedChamps').removeClass('hidden');
			}
			if (!showRec && !showOwned) {
				showError('No information was found. Sorry!');
			}

			$('html,body').animate({
			   scrollTop: $(".results").offset().top
			});
		},
	    error: function (jqXHR, textStatus, errorThrown) {
	    	showError(clarifyError(jqXHR.statusCode().status+': '+jqXHR.responseText));
	    },
	    complete: function() {
	    	querying = false;
	    	$('#submitButton').removeClass('m-progress');
	    }
	});
}

function showError(error) {
	$('#formError').html('An error has occured. ' + error);
	$('#formError').removeClass('hidden');	
}

function clarifyError(error) {
	console.log(error);
	if (error.indexOf('404') !== -1) {
		return 'Summoner not found!';
	} else if (error.indexOf('500') !== -1) {
		return 'Something bad happened!';
	} else if (error.indexOf('429') !== -1) {
		return 'Please try again later.';
	}
	return "Sorry!";
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
