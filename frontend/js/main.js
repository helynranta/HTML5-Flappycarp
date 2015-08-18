sessionStorage.user = "guest"

//YAK! Global variables
var socket, scene, camera, renderer,player, manager, texture, pipe, pipe_tex,ground_tex, tag, ground_mesh
var dae

var player_info = {}
var players = {}
var bots = {}
var bot_clone
var bot_tags = []
var ground = []
var obstacles = []
var collisions = 0
var assets = {}
var running = false

highScores = {}

$(document).ready(function(){
	if(! Detector.webgl ) Detector.addGetWebGLMessage()
	else 
	{
		$(window).on("resize", on_window_resize)
		$('.button').on('click', function() {$(this).hide_else()})
		$('#logout_button').on('click', log_out)
		$('#login_form').submit(formhash)
		$('#register_form').submit(regformhash)
		$('#info_change_form').submit(infoformsubmit)
		$('#passwd_change_form').submit(passwd_change_form)
		$(document).on( 'keypress', onkeydown)
		$(document).on('touchstart', onkeydown)


		player_info["draw"] = false
		player_info["name"] = "guest"
		sessionStorage.username = "guest"
		Physijs.scripts.worker = 'js/three/physijs_worker.js'
		Physijs.scripts.ammo = 'ammo.js'

		camera = new THREE.PerspectiveCamera( 75, 4/5, 1, 50 );
		renderer = new THREE.WebGLRenderer({ alpha: true })

		renderer.setSize( 400, 500 );
		$("#game").prepend( renderer.domElement );

		scene = new Physijs.Scene();

		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		
		scene.setFixedTimeStep(1/80)
		
		setup_game()
	}
});


var load_assets = function (callback)
{
	var done = true
	for( var a in assets )
	{
		if(assets[a] == null) done = false
	}
	if(done)
	{
		console.log("done loading assets: ", assets)
		setTimeout( clear_all_players  , 1000)
		init_connection()
		
		
		$('.header').bigtext({maxfontsize: 100})
		$('.button').bigtext({maxfontsize: 30, minfontsize: 10})
		$('.error').bigtext({maxfontsize: 30, minfontsize: 10})
		start_sec_session()
		check_login()
		
		init_game()
		animate()
	}
}