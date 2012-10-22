var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db;

var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('games', server);

db.open(function(err, db) {
    if(!err) {
        console.log("We are connected");
    }
});

exports.BSON   = BSON;
exports.gameDB = db;