var update_highscore_db = function ()
{
	if(sessionStorage["username"] != "guest")
	{
		$.ajax({
			type: 'POST',
			url: 'php/update_highscore.php',
			data: {'score':highscore_array[sessionStorage.username]},
			complete: function(data)
			{
				update_highscores()
			},
			success: function(data)
			{
				//data = JSON.parse(data)
				if(data["result"] == true)
				{
					//console.log("highscore database updated succesfully!")
				} else if (data["error"] == "bigger score exits"){
					highscore_array[sessionStorage.username] = data["val"]
				} else
				{
					console.log(data["error"])
				}
				
			},
			error: function (qXHR, textStatus, errorThrown)
			{
				console.log(qXHR, textStatus, errorThrown)
			}
		})
	}
}

var fetch_top_10 = function ()
{
	$.ajax({
		type: 'POST',
		url: 'php/fetch_best_scores.php',
		complete: function(data)
		{
			update_highscores()
		},
		success: function(data)
		{	
			data = JSON.parse(data)
			if(data["error"] == "")
			{
				for ( var player in data["players"]){
					highscore_array[player] = data["players"][player]
				}
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})
}

var update_stats_db = function (distance)
{
	$.ajax({
		type: 'POST',
		url: 'php/update_stats.php',
		data: {"distance":distance},
		complete: function(data)
		{
			update_highscores()
		},
		success: function(data)
		{
			data = JSON.parse(data)
			if(data["result"] == true)
			{
				console.log("stats database updated succesfully!")
			} else if (data["error"] == "bigger score exits"){
				highscore_array[sessionStorage.username] = data["val"]
			} else
			{
				console.log(data["error"])
			}
			
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})
}

var get_personal_stats = function ()
{
	$.ajax({
		type: 'POST',
		url: 'php/get_stats.php',
		data: {},
		complete: function(data)
		{
			update_highscores()
		},
		success: function(data)
		{
			data = JSON.parse(data)	
			if(data["result"] == true)
			{
				console.log(data)
				$("#profile #content #stats").html("")
				$("#profile #content #stats").append("<h4>distance traveled: "+parseFloat(data["distance"]).toFixed(2)+" </h4>")
				$("#profile #content #stats").append("<h4>you have played game "+data["count"]+" times</h4>")
			} else {
				console.log(data["error"])
			}
			
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})
}

var set_highscore = function ()
{

	var hs_json = JSON.stringify(highscore_array) 
	localStorage.setItem('gamuScore', hs_json)
	update_highscore_db()
}

var get_highscore = function ()
{

	if(localStorage['gamuScore'] != undefined)
	{
		highscore_array = JSON.parse(localStorage.getItem('gamuScore'))
	}
	update_highscores()
}

var update_highscores = function ()
{

	$("#highscore #content ul").html("")
	if(Object.keys(highscore_array).length > 0)
	{
		for(var player in highscore_array )
		{
			score = highscore_array[player]

			if(parseFloat(score) != 0.0) $("#highscore #content ul").append("<li id='"+score+"'>"+player+": "+score+"</li>")
		}

	}
	$("#highscore #content ul li").sort(function (a, b) {
	    return parseInt(a.id) > parseInt(b.id);
	}).each(function () {
	    var elem = $(this);
	    elem.remove();
	    $("#highscore #content ul").prepend(this)
	});
	//remove 11th, 12th... n:th elemets
	while($("#highscore #content ul").find("li").length > 10)
		$("#highscore #content ul").children().last().remove()
}
