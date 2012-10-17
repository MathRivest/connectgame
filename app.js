/**
 * Module dependencies.
 */

var express = require("express")
    , GameProvider = require('./gameprovider-memory').GameProvider
    , routes = require('./routes')
    , global_socket = {};


var app = express()
    , server = app.listen(3002)
    , io = require('socket.io').listen(server)
    ;

io.sockets.on('connection', function (socket) {
    var g = require('./gameprovider-mongodb').gameDB
    socket.on('session_start', function (session_id) {
        global_socket[session_id] = socket;
        console.log(global_socket);
        global_socket[session_id].emit('received', {msg:'msg'});
    });

    socket.on('username', function (username) {
        console.log('recevied msg username '+ username);
        g.collection('games', function (err, collection) {
            socket.set('hasGame', 0, function () {});
            socket.set('username', username, function () { });
            //console.log(socket.get('hasGame', function () {}));

            //refactor: find the first game with nbplayers < 2 and assign to socket
            collection.find().toArray(function (err, items) {
                socket.get('hasGame', function (err, joined) {
                    for (i in items) {
                        game = items[i];
                        if (game.players.length == 1) {
                            game.players.push(username);
                            collection.update({_id:game._id}, {$set:{players:game.players}});
                            socket.set('hasGame', 1, function () {});
                            socket.emit('gameJoined',{game: game._id, pnum: 2});
                            socket.join(game._id);
                            socket.in(game._id).emit('gameStarts', {game: game._id});
                            console.log('socket joined game with 1 player: '+ game._id);
                            break;

                        }


                    }
                })

                socket.get('hasGame', function (err, joined) {
                    if (!err && 0 == joined)
                    for (i in items) {
                        game = items[i];
                        if (game.players.length == 0) {

                            game.players.push(username);
                            collection.update({_id:game._id}, {$set:{players:game.players}});
                            socket.set('hasGame', 1, function () {});
                            socket.emit('gameJoined',{game: game._id, pnum: 1});
                            socket.join(game._id);
                            console.log('socket joined game with 0 player: '+ game._id);
                            break;
                        }

                    }
                })
            });


        });
    });
    socket.on('sendMove', function(coordinates, game_id){
       socket.in(game_id).broadcast.emit('receiveMove', {coordinates:coordinates});
    });

    socket.on('gameOver', function(username, game_id){
        g.collection('games', function (err, collection) {
            collection.findOne({_id:game_id}, function (err, game) {
                if (!err) {
                    collection.update({_id:game._id}, {$set:{winner:username}});
                }
            })
        })
    })

});
// Required by session() middleware
// pass the secret for signed cookies
// (required by session())
        app.use(express.cookieParser('keyboard cat'));

// Populates req.session
        app.use(express.session());

// Configuration
        app.configure(function () {
            app.set('views', __dirname + '/views');
            app.set('view engine', 'jade');
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(app.router);
            app.use(express.static(__dirname + '/public'));

        });

        app.configure('development', function () {
            app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
            app.locals.pretty = true;
        });

        app.configure('production', function () {
            app.use(express.errorHandler());
        });


// Routes
        app.get('/', routes.index);
        app.post('/username', routes.username);

        app.post('/join-game', routes.join_game);


//app.listen(3002);
        console.log("Express server listening on port %d in %s mode", 3002, app.settings.env);
