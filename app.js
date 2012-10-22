/**
 * Module dependencies.
 */

var express = require("express")
    //, GameProvider = require('./gameprovider-memory').GameProvider
    , routes = require('./routes')
    , global_socket = {};


var app = express()
    , server = app.listen(3001)
    , io = require('socket.io').listen(server)
    ;

/**
 * sockets stuff
 */
io.sockets.on('connection', function (socket) {
    var g = require('./gameprovider-mongodb').gameDB
    var BSON = require('./gameprovider-mongodb').BSON
    socket.on('session_start', function (session_id) {
        global_socket[session_id] = socket;
        console.log(global_socket);
        global_socket[session_id].emit('received', {msg:'msg'});
    });

    //user identified himself
    socket.on('username', function (username) {
        console.log('recevied msg username ' + username);
        g.collection('games', function (err, collection) {
            socket.set('hasGame', 0, function () {
            });
            socket.set('username', username, function () {
            });
            //console.log(socket.get('hasGame', function () {}));

            //refactor: find the first game with nbplayers < 2 and assign to socket
            collection.find().toArray(function (err, items) {
                socket.get('hasGame', function (err, joined) {
                    if (!err && !joined) {
                        for (i in items) {
                            game = items[i];
                            if (game.players.length == 1) {
                                game.players.push(username);
                                collection.update({_id:game._id}, {$set:{players:game.players}});
                                socket.set('hasGame', 1, function () {
                                });
                                socket.emit('gameJoined', {game:game._id, pnum:2, players:game.players});
                                socket.join(game._id);
                                io.sockets.in(game._id).emit('gameReady', {game:game._id, players:game.players});
                                console.log('socket joined game with 1 player: ' + game._id);
                                break;

                            }


                        }
                    }

                })

                socket.get('hasGame', function (err, joined) {
                    if (!err && !joined) {
                        for (i in items) {
                            game = items[i];
                            if (game.players.length == 0) {

                                game.players.push(username);
                                collection.update({_id:game._id}, {$set:{players:game.players}});
                                socket.set('hasGame', 1, function () {
                                });
                                socket.emit('gameJoined', {game:game._id, pnum:1, players:game.players});
                                socket.join(game._id);
                                console.log('socket joined game with 0 player: ' + game._id);
                                break;
                            }

                        }
                    }

                })
            });


        });
    });

    //2 players in game
    socket.on('gameStarts', function (board, game_id) {
        io.sockets.in(game_id).emit('gameStarts', board);
        //io.sockets.emit('gameStarts', board);
    });

    //send coordinates
    socket.on('sendPos', function (data, game_id) {
        socket.broadcast.to(game_id).emit('receivePos', data);
    });

    //send where the coin is to the other player
    socket.on('sendMove', function (data, game_id) {
        socket.broadcast.to(game_id).emit('receiveMove', data);
    });

    //somebody won
    socket.on('gameOver', function (winner, game_id) {
        //socket.broadcast.to(game_id).emit('gameOver', data);
        io.sockets.in(game_id).emit('gameOver', winner);
        g.collection('games', function (err, collection) {
            //collection.findOne({_id:game_id}, function (err, game) {
                if (!err && game != null) {
                    collection.update({_id: new BSON.ObjectID(game_id)}, {$set:{winner:winner.username}});
                    console.log('set winner: '+winner.username+ 'for game '+game_id);
                }
                else {
                    console.log(err);
                    console.log(game_id)
                }
            //})
        })
    });

    //send where the coin is to the other player
    socket.on('updateBoard', function (data) {
        /*console.log(data);
        var winnerNb = data.winnerNb,
            winner = data.winner,
            loser = data.loser;*/

        socket.emit('updateBoard', data);
    });

    //send where the coin is to the other player
    socket.on('disconnect', function (data, game_id) {
        socket.broadcast.to(game_id).emit('gameCancelled', data);
    });


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
/**
 * those routes are deprecated and hav been replaced with events from sockets

 app.post('/username', routes.username);
 app.post('/join-game', routes.join_game);
 */
console.log("Express server listening on port %d in %s mode", 3002, app.settings.env);

