/**
 * Module dependencies.
 */

var express = require("express")
    , routes = require('./routes')
    , global_socket = {};


/*var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);*/

var app = express()
    , server = app.listen(3002)
    , io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    socket.on('session_start', function (session_id) {
        global_socket[session_id] = socket;
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



