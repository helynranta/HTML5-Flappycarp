var on_window_resize = function () {
    /*
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
	*/
	if(window.innerHeight*4<window.innerWidth*5)
	{
		var height = window.innerHeight
		var width = window.innerHeight/5*4
	} else {
		var height = window.innerWidth/4*5
		var width = window.innerWidth
	}

	renderer.setSize( width, height );

	$("canvas").css({"margin-left":-width/2+"px", "margin-top":-height/2})

	if(window.innerHeight*4<window.innerWidth*5)
	{
		var height = window.innerHeight
		var width = window.innerHeight/5*4
	} else {
		var height = window.innerWidth/4*5
		var width = window.innerWidth
	}

	$("#wrapper").css({
		"width": width,
		"height": height,
		"margin-left":-width/2+"px", 
		"margin-top":-height/2
	})
	$("#loader-1").css("margin-top", height/2)
}

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();


var onkeydown = function (event) 
{
	if(running) pause = false;
	var key = event.keyCode | event.charCode
	if(key == 32 && running && !pause){
		event.preventDefault()
		//console.log(event)
		player.applyImpulse(new THREE.Vector3(0,30,0), new THREE.Vector3(0,0,0))
		player.applyImpulse(
			new THREE.Vector3(Math.random(),Math.random(),Math.random()),
			new THREE.Vector3(Math.random(),Math.random(),Math.random())
			)
		if(collisions) {
			player.setLinearVelocity(new THREE.Vector3(0,0,0))
			player.setAngularVelocity(new THREE.Vector3(0,0,0))
			init_game()
		}
	}
	else if(event.type = 'touchstart' && running && !pause)
	{
		player.applyImpulse(new THREE.Vector3(0,30,0), new THREE.Vector3(0,0,0))
		player.applyImpulse(
			new THREE.Vector3(Math.random(),Math.random(),Math.random()),
			new THREE.Vector3(Math.random(),Math.random(),Math.random())
			)
		if(collisions) {
			player.setLinearVelocity(new THREE.Vector3(0,0,0))
			player.setAngularVelocity(new THREE.Vector3(0,0,0))
			init_game()
		}
	}
}
var onkeyup = function (event)
{

}
//http://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
var onmouseclick = function (event) 
{
	var vector = new THREE.Vector3();

	vector.set(
	    ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight ) * 2 + 1,
	    0.5 );

	vector.unproject( camera );

	var dir = vector.sub( camera.position ).normalize();

	var distance = - camera.position.z / dir.z;

	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
}
var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};
var onError = function ( xhr ) {};
/*http://stackoverflow.com/questions/19618286/threejs-text-sprites-font-size-difference-between-webgl-renderer-and-canvas-re*/
var create_tag = function (name) 
{
	if (name === null) name = "guest"

	var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        metrics = null,
        textHeight = 100,
        textWidth = 0,
        actualFontSize = 0.6;

    context.font = "bold " + textHeight + "px Lato";
    metrics = context.measureText(name);
    var textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = "bold " + textHeight + "px Lato";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    context.fillText(name, textWidth / 2, textHeight / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({ map: texture});
    material.transparent = true;
    //var textObject = new THREE.Sprite(material);
    var textObject = new THREE.Object3D();
    var sprite = new THREE.Sprite(material);
    textObject.textHeight = actualFontSize;
    textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
    
    sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);


    textObject.add(sprite);
    textObject.name = name

	return textObject

}

var start_sec_session = function()
{
	$.ajax
	({
		type: "POST",
		url: "php/include/functions.php",
		data: {"type":"start_session"},
		success: function (data)
		{
			//$("#text").append();
		},
		error: function(data)
		{
			$("#login_error").append('<p>'+data+'</p>');
		}
	})
}

$.fn.hide_else = function ()
{
	var target = $(this).attr("target")
	if(target == "none")
		return false
	if(!target) target = $(this).attr("id");
	if(target)
	{
		$('#wrapper').children().each( function () {
		if($(this).attr('id') != target && $(this).attr("id") != "broadcast")
			$(this).fadeOut('slow')
		}).promise().done( function () {
			$("#"+target).fadeTo('slow',1, function(){})
			$(window).trigger('resize')
		})
		if(target == "profile") get_personal_stats()
	}else
	{
		console.log("error on hide_else")
	}
}

var clear_all_players = function ()
{
	//fix angular velocity (dont let magikarp rotate too fast)
	fix_velocities()
	for ( var key in players )
	{
		if(player_info["hash"] != key)
		{
			if(bot_tags[key] && players[key])
			{
				if(bot_tags[key].name != players[key]["name"])
				{
					console.log("player identity changed!")
					console.log("tags.name =", players[key]['name'])
					scene.remove(bot_tags[key])
					bot_tags[key] = create_tag(players[key]["name"])
					scene.add(bot_tags[key])
				}
			}
		}
	}

	setTimeout( clear_all_players  , 1000)
}

var fix_velocities = function()
{
	var x = player._physijs.angularVelocity.x
	var y = player._physijs.angularVelocity.y
	var z = player._physijs.angularVelocity.z
	if(x > 0.5) x= 0.5
	if(x < -0.5) x = -0.5
	if(y > 0.5) y= 0.5
	if(y < -0.5) y = -0.5
	if(z > 0.5) z= 0.5
	if(z < -0.5) z = -0.5
	player.setAngularVelocity(new THREE.Vector3(x,y,z))
}

messages = 0
var add_message = function (msg)
{
	messages++
	//console.log("broadcast recieved:",msg)
	$("#broadcast ul").append("<li class='message'>"+msg+"</li>")
	setTimeout(function(){
		$("#broadcast ul").children().first().hide("blind", 500, function()
		{
			$(this).remove()
		})
	}, 3000)
}