
var querying = false; 	// Prevents users spamming the search button
function loadPlayer() {
	if (querying) return;

	clearPage();

	var region = $('#regionSelect').val();
	var username = $('#summonerName').val();
	username = encodeURIComponent(username.replace(/ /g, ''));
	var role = $('#roleSelect').val();
	var url = '/info/'+region+'/'+username+'/'+role;

	$.ajax({
		type: "get",
		url: url,
	    beforeSend: function() {
	    	querying = true;
	    	$('#submitButton').addClass('m-progress');
	    },
		success: function (data) {
			// querying = false;
			if (data.error != undefined) {
				const error = data.error.status;
				showError(clarifyError(error.status_code, error.message));
				return;
			}

			$('#formError').addClass('hidden');

			var showRec = (data.recommended.length > 0);
			var showOwned = (data.has_chest.length > 0);

			if (showRec) {
				$("#recChampsContainer").html(displayChamps(data.recommended, true, data.version));
				$('#recChamps').fadeIn('slow');
				$('#recChamps').removeClass('hidden');
			}
			if (showOwned) {
				$("#ownedChampsContainer").html(displayChamps(data.has_chest, false, data.version));
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
	    	showError(clarifyError(jqXHR.statusCode().status, jqXHR.responseText));
	    },
	    complete: function() {
	    	querying = false;
	    	$('#submitButton').removeClass('m-progress');
	    },
	    timeout: 5000
	});
}

function showError(error) {
	$('#formError').html('An error has occured. ' + error);
	$('#formError').removeClass('hidden');
}

function clarifyError(statusCode, message) {
	console.log(statusCode, message);
	if (statusCode == 404) {
		return 'Summoner not found!';
	} else if (statusCode == 500) {
		return 'Something bad happened!';
	} else if (statusCode == 429) {
		return 'Please try again later.';
	}
	return "Sorry!";
}

function displaySplash(champ) {
	var url = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.id+"_0.jpg";
	var champHtml = "<img src=\""+url+"\">"
		+ "<div><span class=\"championName\">"+champ.name+"</span><br>"
		+ "Mastery Points: "+champ.champion_points+"</span>"
		+"</div>";
	$('.championSplash').html(champHtml);
}

function displayChamps(json, showSplash, version) {
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
			+ "<img src=\"https://ddragon.leagueoflegends.com/cdn/" + version + "/img/champion/" + champs[i].image.full + "\"/>"
			+ "<span class=\"championGrade\">"+champs[i].champion_points + "</span>"
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
