var init_connection = function () 
{
	var ip = 'http://104.155.1.104:3000'
	//var ip = 'localhost:3000'
	socket = io.connect(ip);

	socket.emit('register', player_info);
	
	socket.on('init bots', socket_init_bots)
	socket.on('update', socket_update)
	socket.on('player init', socket_player_init)
	socket.on('player id', socket_player_id)
	socket.on('player disconnect', socket_player_disconnect)
	socket.on('new player connects', socket_new_player)
	socket.on('broadcast', socket_broadcast)
}
var socket_update = function ( msg ) {
	for( var key in players)
	{
		delete players[key]
	}
	
	//console.log(Object.keys(msg).length)
	//console.log(scene.children)
	players = msg
	for(var key in msg)
	{
		if(player_info["hash"] != msg[key]["hash"])
			players[key] = msg[key]
	}
	for(var key in players)
	{
		if(msg[key] == undefined)
		delete players[key]
	}

	if(Object.keys(msg).length != Object.keys(players).length)
	{
		
	}
	//console.log(Object.keys(msg).length)
	//console.log(player)
	update_bots()
}
var socket_player_init = function ( msg ) {	
	for ( var key in msg)
	{
		player_info[key] = msg[key]
	}

}
var socket_init_bots = function ( msg )
{
	console.log("init bots:", Object.keys(msg).length - 1)
	console.log("me: ", player_info["hash"])
	for (var key in msg)
	{
		if(msg[key]["hash"] != player_info["hash"])
		{
			console.log('new player connects: ', msg[key]["name"], " - ", msg[key]["hash"])
			if(bot_tags[key]) scene.remove(bot_tags[key])

			bot_tags[key] = create_tag(msg[key]["name"])
			scene.add(bot_tags[key])
			
			var bot = dae.clone()
			//bot.updateMatrix()
			
			if(bot != undefined)
			{
				var skinned = bot.children[1].children[0]
				skinned.geometry.animation.initialized = false
				var animation = new THREE.Animation(skinned,skinned.geometry.animation)
				if(animation.data != undefined) animation.play()
				else console.log("bot animation data undefined")
			}	
			

			bots[key] = bot
			scene.add(bots[key])
		}
	}
	add_message("connection to server established")
}

var socket_new_player = function ( msg )
{
	console.log('new player connects: ', msg)
	var key = msg["hash"]

	if(bot_tags[key]) scene.remove(bot_tags[key])
	bot_tags[key] = create_tag(msg["name"])
	scene.add(bot_tags[key])
	
	var bot = dae.clone()
	//bot.updateMatrix()
	
	if(bot != undefined)
	{
		var skinned = bot.children[1].children[0]
		skinned.geometry.animation.initialized = false
		var animation = new THREE.Animation(skinned,skinned.geometry.animation)
		if(animation.data != undefined) animation.play()
		else console.log("bot animation data undefined")
	}	
	

	bots[key] = bot
	scene.add(bots[key])
}

var socket_player_disconnect =  function ( key ) 
{
	
	//if(msg) delete msg
	//else console.log("error when deleting from players", msg)
	//console.log(bots[msg])
	console.log("player disconnect: ", key)
	
	if(bots[key]) scene.remove(bots[key])
	else console.log("no bot for this player, odd")
	if(bot_tags[key]) scene.remove(bot_tags[key])
	if(players[key]) delete players[key]
	if(bots[key]) delete bots[key]
	if(bot_tags[key]) delete bot_tags[key]
}

var socket_player_id =  function ( msg ) 
{
	player_info["hash"] = msg
	//console.log(msg)
}

var socket_broadcast = function ( msg )
{
	username = msg["u"]
	highscore = msg["hs"]
	highscore_array[username] = highscore
	add_message("NEW PHS!"+username+":"+highscore);
	update_highscores();
}