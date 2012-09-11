
/**
 * Module dependencies.
 */

var express = require("express")
    , routes = require('./routes');
var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(3001);
console.log("Express server listening on port %d in %s mode", 3001, app.settings.env);

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style 
  });
});

io.sockets.on('connection', function (socket) {
    socket.emit('welcome', { msg: 'Welcome to the connect 4 game' });
    socket.on('newmessage', function (data) {
        console.log(data);
        socket.emit('newresponse', data);
    });
});
