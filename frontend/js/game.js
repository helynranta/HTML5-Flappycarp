var setup_game = function () 
{
	player_info["name"] = sessionStorage.username
	player_info["position"] = [0,0]
	player_info["rotation"] =[0,0,0]
	player_info["draw"] = false

	assets["magikarp_tex"] = null
	assets["magikarp"] = null
	assets["pipe"] = null
	assets["pipe_tex"] = null
	assets["ground_mesh"] = null
	assets["ground_tex"] = null
	//AMBIENT LIGHT
	var ambient = new THREE.AmbientLight( "white" );
	scene.add( ambient );

	manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		//console.log( item, loaded, total );
	};
	//LOADERS /*MAGIKARP*/
	var texture = new THREE.Texture();
	var loader = new THREE.ImageLoader( manager );
	loader.load( 'assets/m/magikarp_tex.png', function ( image ) {
		texture.image = image;
		texture.needsUpdate = true;
		assets["magikarp_tex"] = 1
		load_assets()
	} );
	// model
	pipe_tex = new THREE.Texture();
	loader.load( 'assets/pipe.png', function ( image ) {
		pipe_tex.image = image;
		pipe_tex.needsUpdate = true;
		assets["pipe_tex"] = 1
		load_assets()
	} );
	ground_tex = new THREE.Texture();
	loader.load( 'assets/ground_tex.png', function ( image ) {
		ground_tex.image = image;
		ground_tex.needsUpdate = true;
		assets["ground_tex"] = 1
		load_assets()
	} );
	/*COLLADA IMPORT*/
	loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( 'assets/m/magikarp.dae', function ( collada ) {
		dae = collada.scene
		
		dae.traverse( function ( child ) {
			if ( child instanceof THREE.SkinnedMesh ) {
				child.material.map = texture;
				//var animation = new THREE.Animation(child, child.geometry.animatio)
				//animation.play()
			}
		} );

		//setup player
		player = new Physijs.CapsuleMesh(
			new THREE.BoxGeometry( 1.1, 1.1, 0.8,1),
			new THREE.MeshLambertMaterial({transparent: true, opacity: 0.0}),
			2)
		player.geometry.visible = false
		//console.log(player)
		player.addEventListener( 'collision', player_collision_handler);
		player.add(dae.clone())
		var skinned = player.children[0].children[1].children[0]
		var animation = new THREE.Animation(skinned,skinned.geometry.animation)

		if(animation.data != undefined) animation.play()
		else console.log("player animation data undefined")
		
		var name;
		
		if(sessionStorage.username) name = sessionStorage.username
		else name = "guest"
		
		tag = create_tag(name)
		tag.name = name;
		tag.position.set(0,10,0)
		scene.add(tag)
		assets["magikarp"] = 1		
		scene.add(player)
		load_assets()
	}, onProgress, onError );
	//pipe
	var loader = new THREE.OBJLoader( manager );
	loader.load( 'assets/pipe.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = pipe_tex;
				pipe = child.geometry
			}
		} );
		
		//scene.add( object );
		assets["pipe"] = 1
		load_assets()
	}, onProgress, onError );

	loader.load( 'assets/ground.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = ground_tex;
				ground_mesh = child.geometry
			}
		} );
		
		//scene.add( object );
		assets["ground_mesh"] = 1
		load_assets()
	}, onProgress, onError );

	fetch_top_10()
}
var player_collision_handler = function( other_object, relative_velocity, relative_rotation, contact_normal ) 
{
	collisions++
	if(collisions == 1)
	{
		if(highscore_array[sessionStorage.username] < player.position.x || highscore_array[sessionStorage.username] == undefined)
		{
			highscore_array[sessionStorage.username] = (player.position.x).toFixed(1)
			if(sessionStorage.username != "guest")
			{
				socket.emit("broadcast", {'u':sessionStorage.username, 'hs': highscore_array[sessionStorage.username]})
				console.log("should broadcast")
			}
			set_highscore()
			$("#main #content p").html("logged in as: "+sessionStorage.username+"<br>personal best:"+highscore_array[sessionStorage.username])
		}
		if(sessionStorage['username'] != "guest")	update_stats_db(player.position.x)	
	}

	if(Math.round(contact_normal.y*10)/10 == -1)
	{
		player.applyImpulse(new THREE.Vector3(0,20,0), new THREE.Vector3(0,0,0))
		player.applyImpulse(
				new THREE.Vector3(Math.random(),Math.random(),Math.random()),
				new THREE.Vector3(Math.random(),Math.random(),Math.random())
				)
	}
}

var init_game = function ()
{
	$("#score p").hide()
	$("#score span").hide()

	collisions = 0
	if(obstacles.length)
	{
		for(var o in obstacles){
			if(obstacles[o])
			scene.remove(obstacles[o])	
		} 
	}
	obstacles = []
	if(ground.length)
	{
		for(var g in ground){
			if(ground[g])
				scene.remove(ground[g])
		} 		
	}
	ground = []
	//set camera position
	camera.position.set(0,10,15)
	player.__dirtyPosition = true
	player.__dirtyRotation = true
	player.position.set(0,10,0)
	player.rotation.set(0,0,0)
	//create ground boxes
	for(var i = 0; i < 8; i++)
	{
		var g = new Physijs.BoxMesh(
			//objects must overlap, or otherwise player will eventually go between them in simulation
			ground_mesh,
			new THREE.MeshLambertMaterial({color:0x88888, map: ground_tex}),
			0)
		g.scale.set(1,1,1)
		g.__dirtyPosition = true
		g.__dirtyRotation = true
		g.position.x =  -10+i*20
		g.setLinearFactor(THREE.Vector3(0,0,0))
		g.setAngularVelocity(THREE.Vector3(0,0,0))
		g.name = "ground"
		g.tag = "ground"
		ground.push(g)
		scene.add(ground[i])
	}
	//pipes
	for(var i = 0; i < 8; i++)
	{
		var offset = Math.sin(camera.position.x+obstacles.length)*3
		var o = new Physijs.ConvexMesh(
			pipe,
			new THREE.MeshLambertMaterial({color: 'rgb(0,120,0)', map: pipe_tex}),
			0)

		o.__dirtyPosition = true
		o.position.x = 10 + (i+1)*5
		o.position.y = 5 + offset
		obstacles.push(o)
		o.name = "pipe"
		scene.add(obstacles[i])
		//up part
		var o2 = new Physijs.ConvexMesh(
			pipe,
			new THREE.MeshLambertMaterial({color: 'rgb(0,120,0)', map: pipe_tex}),
			0)
		//o2.__dirtyRotation = true
		o2.rotation.set(3.14,0,0)
		o2.position.x = 10 + (i+1)*5
		o2.position.y = 20 + offset
		o2.name = "pipe"
		obstacles.push(o2)
		i++
		scene.add(obstacles[i])
	}
	pause = true
	running = true
	player_info["draw"] = false
	$("#load_wrapper").fadeOut('slow',function(){$('#wrapper').fadeIn('slow');$(window).trigger('resize')})

}

var update = function () 
{
	if($("#game").css("display") == "none")
	{
		pause = true
		player_info["draw"] = false
		player.setLinearVelocity(new THREE.Vector3(0,0,0))
		player.setAngularVelocity(new THREE.Vector3(0,0,0))
	}

	if(!collisions && !pause)
	{
		camera.position.x += 0.05
		tag.position.set (camera.position.x,player.position.y +1,0)

		player.__dirtyPosition = true
		//player.__dirtyRotation = true
		player.position.x = camera.position.x
		player.position.z = 0
		player_info["draw"] = true
		
		$("#score").html("<h2>Score:"+(player.position.x).toFixed(1)+"</h2><p>new personal highscore!</p><h4>du är död!<br>tap to restart</h4>")
		if(player.position.x > highscore_array[sessionStorage.username]) $('#score p').show()
		else $('#score p').hide()
		$("#score h4").hide()
	} else{
		tag.position.set (player.position.x,player.position.y +1,0)
		player.__dirtyPosition = true
		player.position.z = 0
		$("#score h4").show()
	}
	
	//console.log(ground[0].scale.x)
	if( camera.position.x - ground[0].position.x > 40)
	{
		ground[0].__dirtyPosition = true
		ground[0].__dirtyRotation = true
		ground[0].position.x += ground.length*20
		//ground[0].geometry.computeBoundingBox ()
		ground.push(ground.shift())
	}
	if(camera.position.x - obstacles[0].position.x > 20)
	{
		obstacles[0].__dirtyPosition = true
		obstacles[0].position.x += obstacles.length*5
		obstacles[0].position.y = 5 + Math.sin(camera.position.x+obstacles.length)*3
		obstacles.push(obstacles.shift())
		//up part
		obstacles[0].__dirtyPosition = true
		obstacles[0].position.x += obstacles.length*5
		obstacles[0].position.y =  20 + Math.sin(camera.position.x+obstacles.length)*3
		obstacles.push(obstacles.shift())
	}
			
	//console.log(collisions)
	if(player.position.y > 20)
		player.position.y = 20
	//$("#debug").html("").append("x: "+player.position.x+"<br>y: "+player.position.y)
	player_info["position"] = [player.position.x, player.position.y]
	player_info["rotation"] = [player.rotation.x, player.rotation.y, player.rotation.z]
	player_info["name"] = sessionStorage.username
}

var render = function () {
	renderer.render(scene, camera)
}
/*DRAWING
http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
*/
var now
var then = Date.now()
var interval = 1000/60
var delta
var pause = true
var highscore_array = {}
var clock = new THREE.Clock()
/*GAME LOOP*/
var animate = function () {
	window.requestAnimFrame(animate)

	now = Date.now()
	delta = now - then

	if(delta > interval)
	{
		if(running)
		{	
			update()
			if(!pause) scene.simulate(1/60, 1)
		} else {
			player_info["draw"] = false
			$("canvas").css("display", "none")
		}
		then = now - (delta % interval)
		render()

		if(socket) socket.emit("update", player_info)
		THREE.AnimationHandler.update(clock.getDelta()/2)
	}
}

var update_bots = function ()
{
	if(Object.keys(players).length > 1 && Object.keys(bots).length > 0) 
	{
		for( var key in players)
		{
			if(players[key]["hash"] != player_info["hash"] && bots[key] != undefined)
			{
				if(players[key]["draw"])
				{
					//console.log("update bots:", key)
					if(!bots[key].position || !bots[key].rotation) continue

					var pos = players[key]["position"]
					var rot = players[key]["rotation"]
					//console.log(bots[b].position)
					if(!pos || !rot) continue

					bots[key].__dirtyPosition = true
					bots[key].__dirtyRotation = true
					bots[key].position.set(pos[0],pos[1], 0)
					bots[key].rotation.set(rot[0], rot[1], rot[2])

					if(bot_tags[key]) bot_tags[key].position.set(pos[0], pos[1] + 2, 0)
				} else {
					bots[key].__dirtyPosition = true
					bots[key].position.set(0,0, -100)
					bot_tags[key].position.set(0,0,-100)
				}
			}
		}
	}
}

