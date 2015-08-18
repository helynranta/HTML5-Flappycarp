
$(document).ready(function () {
	$("#login").submit(adminsubmit)
	$('#info').submit(admininfosubmit)
	$('#logout').click(log_out)
	$('#ban').click(ban)
	$(document).on('click', '.player', expand_info)
	$("#remove").click(remove_player)
	check_login()
	list_players()
	$("#load_wrapper").fadeOut()
})

var adminsubmit = function (e) 
{
	$("#load_wrapper").fadeIn(50)
	e.preventDefault()

	$("#login .error").html("")

	var form = $("#login")
	var username = $("#login [name=username]")
	var password = $("#login [name=password]")
	var error = $("#login .error")

	if(password.val() == "" || username.val() == "")
		$(error).append("<p>plz gimme all details</p>")

	if($("#login .error")[0].innerHTML == "")
	{

		var postData = $(form).serializeArray()
		postData.push({name: "username", "value" : username.val()})
		postData.push({name: "password", value : hex_sha512(password.val())})
		$.ajax({
			type: 'POST',
			url: 'php/login.php',
			data: postData,
			success: function(data)
			{
				data = JSON.parse(data)
				console.log(data)
				if(data["result"] == true){
					$('#login').fadeOut(500);
					$('content').fadeIn('slow')
				} 
				else {
					$("#login .error").append(data["error"])
				}

			},
			error: function (qXHR, textStatus, errorThrown)
			{
				console.log(qXHR, textStatus, errorThrown)
			},
			complete: function(data)
			{
				check_login()
				list_players()
			}
		})
	}

	return false
}

var check_login = function ()
{
	$("#load_wrapper").fadeIn(50)
	$.ajax({
		type: 'POST',
		url: 'php/login_check.php',
		success: function(data)
		{
			data = JSON.parse(data)
			console.log("check_login echo: ",data)
			if(data["result"] == true){
				$('#login').fadeOut(500);
				$('main').fadeIn('slow')
				$('#logout').fadeIn(500)
			} else {
				$('main').fadeOut(500)
				$('#logout').fadeOut(500)
				$('#login').fadeIn(500)
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			$("#load_wrapper").fadeOut()
		}
	});
}
var log_out = function()
{
	$("#load_wrapper").fadeIn(50)
	$.ajax({
		type: 'POST',
		url: '../php/include/logout.php',
		data: {'log_out':true},
		complete: function()
		{
			check_login()
			$("#logout").show();
		},
		success: function(data)
		{
		
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
			$("#load_wrapper").fadeOut()
		}
	})
}

var list_players = function ()
{
	$("#load_wrapper").fadeIn(50)
	$.ajax({
		type: 'POST',
		url: 'php/list_players.php',
		success: function(data)
		{
			data = JSON.parse(data)
			if(data["result"] == true)
			{
				$("main table").find('.player').each(function(){$(this).remove()})
				for(var player in data["players"])
				{
					var uid =  data["players"][player]["uid"]
					var username =  data["players"][player]["username"]
					var tr = "<tr class='player' id='"+uid+"'><td class='uid'>"+uid+"</td><td class='username'>"+username+"</td></tr>"
					$("main table").append(tr)
				}
			} 
			else {
				
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			$("#load_wrapper").fadeOut()
		}
	});
}

var expand_info = function ()
{
	$("#load_wrapper").fadeIn(50)
	var uid = $(this).children('.uid').html()
	$.ajax({
		type: 'POST',
		url: 'php/find_info.php',
		data: [{"name":"uid", "value":uid}],
		success: function(data)
		{
			data = JSON.parse(data)
			if(data["result"] == true){
				$('#info').hide("blind", 200, function(){
					$('#info').prev().show(0, function()
					{
						$('#info').detach().appendTo("table").insertAfter("#"+data["uid"]).prev().hide(0, function()
						{
							$("#info form [name=race]").val(data["race"])
							$("#info form [name=religion]").val( data["religion"])
							$("#info form [name=home]").val( data["home"])
							$('#info #header').html("<table>"+$('#info').prev().html()+"</table>")
							$('#info #stats').html("")
							$('#info #stats').append("<p>highscore:"+data["highscore"]+"</p>")
							$('#info #stats').append("<p>player has played game "+data["count"]+" times</p>")
							$('#info #stats').append("<p>total distance raced: "+parseFloat(data["distance"]).toFixed(2)+"</p>")
							if(data['ban'] == 1) $('#ban').html("unban")
							else $('#ban').html("ban")
							$('#info').show('blind', 200)
						})
					})
				})
			} 
			else {
				
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			$("#load_wrapper").fadeOut()
		}
	});
}

var admininfosubmit = function (e)
{
	$("#load_wrapper").fadeIn(50)
	e.preventDefault()
	var uid = $(this).find('.uid').html()

	$.ajax({
		type: 'POST',
		url: '../php/update_info.php',
		data: [
		{"name":"user_id", "value":uid},
		{"name":"race", "value":$("#info form [name=race]").val()},
		{"name":"religion", "value":$("#info form [name=religion]").val()},
		{"name":"home", "value":$("#info form [name=home]").val()}
		],
		success: function(data)
		{
			console.log(data)
			if(data["result"] == true){
				
			} else {
				
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			$("#load_wrapper").fadeOut()
		}
	});
	return false
}

var remove_player = function ()
{
	$("#load_wrapper").fadeIn(50)
	$("#info").hide("blind",100, function(){
		var uid = $(this).find('.uid').html()
		$.ajax({
			type: 'POST',
			url: 'php/remove_player.php',
			data: [{"name":"user_id", "value":uid},],
			success: function(data)
			{
				console.log(data)
				if(data["result"] == true){
					
				} else {
					
				}
			},
			error: function (qXHR, textStatus, errorThrown)
			{
				console.log(qXHR, textStatus, errorThrown)
			},
			complete: function(data)
			{
				$("#load_wrapper").fadeOut()
				list_players()
			}
		});
	})
	
}

var ban = function ()
{
	$("#load_wrapper").fadeIn(50)
	var uid = $(this).parent().find('.uid').html()
	ban = 0
	if($('#ban').html() == "ban") 
		ban = 1
	$.ajax({
		type: 'POST',
		url: 'php/ban.php',
		data: [
		{"name":"uid", "value":uid},
		{"name":"ban", "value": ban}
		],
		success: function(data)
		{
			console.log(data)
			if(data = JSON.parse(data))
			{
				if(data["result"] == true){
					if(data['ban'] == 1)
						$('#ban').html("unban")
					else
						$('#ban').html("ban")
				}
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			$("#load_wrapper").fadeOut()
		}
	});
	return false
}