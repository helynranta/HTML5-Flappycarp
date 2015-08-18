var express = require('express')
var session = require('express-session')
uuid = require('uuid')
var app = express();
app.use(session({
        secret:'3s5ad4f65a4s6df1as6df1a8sdf1',
        cookie:{
                secure: true
        },
        resave: true,
        saveUninitialized: true
}))
app.use(express.static(__dirname + '/public'));
var express = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen("3000");
var time = 0
var players = {}
io.on('connection', function(socket){
    var player = {}
    var id = uuid.v4()
    /*
    */
    socket.on('register', function (data) {
        player = {}
        socket.emit("player id", id)
        console.log("registered successfully:", id)
        player["last_server_update"] = time
        if(data["name"]) player["name"] = data["name"]
       else player["name"] = "guest"
        player["hash"] = id
        players[id] = player
        console.log("nro of players now: ", Object.keys(players).length)
        socket.broadcast.emit('new player connects', player)
        socket.emit("init bots", players)
    });
    /*
    */
    socket.on('update', function ( msg )
    {
        for( var key in players)
        {
            if(players[session.id] == undefined)
            {
            }
        }
        key = msg["hash"]
        if(players[key])
        {
            players[key] = msg
            players[key]["last_server_update"] = time
        }
        socket.emit('update', players)
    })
    /*
    */
    socket.on('disconnect', function () {
        io.sockets.emit('player disconnect', id)
        delete players[id]
        console.log("disconnect from:",id)
        //console.log("nro of players left:",Object.keys(players).length)
    });
    socket.on('log players', function(msg){
        //console.log(players)
    })
    /*
    */
   socket.on('broadcast', function(msg)
    {
        socket.broadcast.emit('broadcast', msg)
    })
});
/*cleanup function*/
setInterval(function(){
    time++
    if(Object.keys(players).length > 0)
    {
        for ( var p in players)
        {
            if(parseInt(players[p]["last_server_update"]) > time+10)
            {
                delete players[p]
            }
        }
        if(players[p] == undefined)
        {
            delete players[p]
        }
        if(p == undefined || p == null)
        {
            delete players[p]
        }
    }
}, 1000)
