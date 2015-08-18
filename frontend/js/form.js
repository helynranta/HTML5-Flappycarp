/*
	form.js

	handle hashing of the password for login and registration forms

	also now checking login, username and loggout
*/

function formhash(e)
{
	//submit the form
	e.preventDefault()

	$("#login #content .error").html("")
		
	if($('#login_form [name=username]').val() == "" || $('#login_form [name=passwd]').val() == "")
		$("#login #content .error").append('<p>You must provide all the requested details.</p>')
	if($("#register #content .error")[0].innerHTML == "")
	{
		$("#load_wrapper").fadeTo('slow', 0.5)
		var form = $("#login_form");
		var password = $("#login_form [name=passwd]");
		//create a new element input, this will be our hashed password field.
		//add the new element to our form
		var passwd = (hex_sha512($(password).val()));
		//make sure the plaintext pwd doenst get sent
		$(password).val("");
		
		var postData = $(this).serializeArray();
		postData.push({"name": "p", "value":passwd})
		var action = 'php/include/process_login.php';
		$.ajax({
			type: 'POST',
			url: action,
			data : postData,
			success: function(data)
			{
				data = JSON.parse(data)
				if(data["result"] == true)
				{
					sessionStorage.username = data;
					player_info["name"] = sessionStorage.username
					$("#main").hide_else()
					$("#login_button").hide()
					$("#logout_button").show()
					$("#register_button").hide();
					$("#profile_button").show()
					scene.remove(tag)
					tag = create_tag(sessionStorage.username)
					scene.add(tag)
				} else {
					$("#login #content .error").append('<p>'+data['error']+'</p>');
				}
			},
			error: function(data)
			{
				console.log(data)
				$("#login #content .error").html('<p>'+data+'</p>');
			},
			complete: function(data)
			{
				if(highscore_array[sessionStorage.username] == undefined)
					highscore_array[sessionStorage.username] = 0
				$("#main #content p").html("logged in as: "+sessionStorage.username+"<br>personal best:"+highscore_array[sessionStorage.username])
				$("#load_wrapper").fadeOut('slow')
				check_login()
			}
		});
		//$('#login_form').submit();
		$(passwd).remove()
	}
	return false
}
/*
	HANDLE REGISTRATION FORM
*/
var regformhash = function(e)
{	
	e.preventDefault()
	$("#register #content .error").html('')
	var password = $("#register_form [name=password]")
	var username = $("#register_form [name=username]")
	var pass_conf = $("#register_form [name=password-conf]")
	//check each field has a value
	if(username.val() == '' || password.val() == '')
	{
		$("#register #content .error").append("<p>You must provide all the requested details.</p>");
	}
	//check username
	re = /^\w+$/;
	if(!re.test(username.val()))
	{
		$("#register #content .error").append("<p>username must contain only letters, numbers and underscores.</p>");
		username.focus();
	}
	//check that password is sufficiently long
	if(password.val())
	{
		if(password.val().length < 6)
		{
			$("#register #content .error").append("<p>Password must be at least 6 characters long.</p>");
			password.focus();
		
		}	
	}
	
	//at least one number, one lowercase and one uppercase letter
	//at least six characters
	var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	if(!re.test(password.val()))
	{
		$("#register #content .error").append("<p>Passwords must contain at least one number, one lowercase and one uppercase character.</p>");
		password.focus();
	}
	//check that password and confirmation are the same
	if(password.val() != pass_conf.val())
	{
		console.log(password.val(), "  !=  ", pass_conf.val())
		$("#register #content .error").append("<p>Your password and confirmation do not match.</p>");
		password.focus();
	}
	
	if($("#register #content .error")[0].innerHTML == "")
	{
		$("#load_wrapper").fadeTo('slow', 0.5)
		//create a new element input,this will be our hashed password field
		var p = document.createElement('input');
		$(p).attr("id", "passwd_hidden")
		$(p).val(hex_sha512($(password).val()))
		//add the new element to our form
		$("#register_form").append(p);
		var postData = $(this).serializeArray()
		postData.push({name: 'p', 'value':$(p).val()})
		//make sure the plaintext password doesnt get sent
		$(password).val("")
		$(pass_conf).val("")
		console.log(postData)
		$.ajax({
			type: 'POST',
			url: 'php/include/register.inc.php',
			data: postData,
			success: function(data)
			{
				console.log(data)
				if(data != "")
				{
					$("#register #content .error").html(data);
				} else {
					$("#main").hide_else()
					sessionStorage.username = data
					player_info["name"] = data
				}
			},
			error: function(data)
			{
				console.log(data)
				$("#register #content .error").html('<p>'+data+'</p>');
			},
			complete: function(data)
			{
				$("#load_wrapper").fadeOut('slow')
			}

		})
		$("#passwd_hidden").remove()
	}
	return false;
}
var check_login = function ()
{
	$.ajax({
		type: 'POST',
		url: './php/include/functions.php',
		data: {'type':'check_login'},
		success: function(data)
		{
			console.log("check_login echo: ",data)
			
			if(data!="false")
			{
				$("#login_button").hide()
				$("#logout_button").show()
				$("#register_button").hide()
				$("#profile_button").show()

				sessionStorage.username = data
				get_personal_stats()
				infofetch()
			} else {
				$("#login_button").show()
				$("#logout_button").hide()
				$("#register_button").show()
				$("#profile_button").hide()
				sessionStorage.username = "guest"
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		},
		complete: function(data)
		{
			if(highscore_array[sessionStorage.username] == undefined)
				highscore_array[sessionStorage.username] = 0
			
			$("#main #content p").html("logged in as: "+sessionStorage.username+"<br>personal best:"+highscore_array[sessionStorage.username])
			$("#profile #content .header div").html("PROFILE: "+sessionStorage.username)
			if(sessionStorage.username != tag.name) 
			{
				scene.remove(tag)
				tag=create_tag(sessionStorage.username)
				scene.add(tag)
			}
			$(window).trigger('resize')
		}
	});
}
var log_out = function()
{
	$.ajax({
		type: 'POST',
		url: 'php/include/logout.php',
		data: {'log_out':true},
		complete: function()
		{
			if(highscore_array["guest"] == undefined)
				highscore_array["guest"] = 0

			scene.remove(tag)
			sessionStorage.username = "guest"
			player_info["name"] = "guest"
			tag = create_tag(sessionStorage.username)
			scene.add(tag)
			$("#main #content p").html("logged in as: "+sessionStorage.username+"<br>personal best:"+highscore_array[sessionStorage.username])
			$('#main').hide_else()
		},
		success: function(data)
		{
			$("#login_button").show()
			$("#logout_button").hide()
			$("#register_button").show()
			$("#profile_button").hide()
			player_info["name"] = sessionStorage.username
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})
}

var infoformsubmit = function(e)
{
	e.preventDefault()

	$.ajax({
		type: 'POST',
		url: 'php/update_info.php',
		data: $(this).serializeArray(),
		complete: function()
		{
			
		},
		success: function(data)
		{
			console.log(data)
			//data = JSON.parse(data)

			if(data["result"] == false)
			{
				console.log("info form submit failed!")
			}
			
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})

	return false;
}

var infofetch = function()
{

	$.ajax({
		type: 'POST',
		url: 'php/fetch_info.php',
		data: $(this).serializeArray(),
		complete: function()
		{
			
		},
		success: function(data)
		{
			data = JSON.parse(data)
			if(data['result'] = true)
			{
				$('#info_change_form [name=race]').val(data['race'])
				$('#info_change_form [name=religion]').val(data['religion'])
				$('#info_change_form [name=home]').val(data['home'])
			} else {
				console.log("info fetch failed!")
			}
		},
		error: function (qXHR, textStatus, errorThrown)
		{
			console.log(qXHR, textStatus, errorThrown)
		}
	})

	return false;
}

/*
	HANDLE PASSWD CHANGE!
*/
var passwd_change_form = function(e)
{	
	e.preventDefault()
	$("#profile #content .error").html('')

	var old_passwd = $("#passwd_change_form [name=old-passwd]")
	var new_passwd = $("#passwd_change_form [name=new-passwd]")
	var new_passwd_conf = $("#passwd_change_form [name=new-passw-conf]")

	//check each field has a value
	if(old_passwd.val() == '' || new_passwd.val() == '' || new_passwd_conf.val() == '')
	{
		$("#profile #content .error").append("<p>You must provide all the requested details.</p>");
	}
	//check that password is sufficiently long
	
	if(new_passwd.val())
	{
		if(new_passwd.val().length < 6)
		{
			$("#profile #content .error").append("<p>Password must be at least 6 characters long.</p>");
			new_passwd.focus();
		
		}	
	}

	//at least one number, one lowercase and one uppercase letter
	//at least six characters
	var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	if(!re.test(new_passwd.val()))
	{
		$("#profile #content .error").append("<p>Passwords must contain at least one number, one lowercase and one uppercase character.</p>");
		new_passwd.focus();
	}
	//check that password and confirmation are the same
	if(new_passwd.val() != new_passwd_conf.val())
	{
		$("#profile #content .error").append("<p>Your password and confirmation do not match.</p>");
		new_passwd.focus();
	}
	if($("#profile #content .error")[0].innerHTML == "")
	{
		$("#load_wrapper").fadeTo('slow', 0.5)
		var form = document.createElement('form')
		$(form).attr('id', 'temp_form')
		var postData = $(form).serializeArray()
		
		var op = hex_sha512($(old_passwd).val())
		var p = hex_sha512($(new_passwd).val())
		
		postData.push({'name': 'p', 'value':p})
		postData.push({'name': 'op', 'value':op})

		console.log(postData)
		$.ajax({
			type: 'POST',
			url: 'php/change_passwd.php',
			data: postData,
			success: function(data)
			{
				data = JSON.parse(data)
				if(data["result"] = true){
					log_out()
					$("#passwd_change_form [name=old-passwd]").val('')
					$("#passwd_change_form [name=new-passwd]").val('')
					$("#passwd_change_form [name=new-passw-conf]").val('')
				} 
				else {
					$("#profile #content .error").append(data["error"])
				}

			},
			error: function (qXHR, textStatus, errorThrown)
			{
				console.log(qXHR, textStatus, errorThrown)
			},
			complete: function(data)
			{
				$("#load_wrapper").fadeOut('slow')
			}
		})
		
	}
	$(form).remove()
	return false;
}