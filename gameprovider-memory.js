var gameCounter = 1;

GameProvider = function(){};
GameProvider.prototype.dummyData = [];

GameProvider.prototype.findAll = function(callback) {
    callback( null, this.dummyData )
};

GameProvider.prototype.findById = function(id, callback) {
    var result = null;
    for(var i =0;i<this.dummyData.length;i++) {
        if( this.dummyData[i]._id == id ) {
            result = this.dummyData[i];
            break;
        }
    }
    callback(null, result);
};

GameProvider.prototype.save = function(games, callback) {
    var game = null;

    if( typeof(games.length)=="undefined")
        games = [games];

    for( var i =0;i< games.length;i++ ) {
        game = games[i];
        game._id = gameCounter++;
        game.created_at = new Date();

        if( game.players === undefined )
            game.players = [];

        for(var j =0;j< game.players.length; j++) {
            game.players[j].created_at = new Date();
        }
        this.dummyData[this.dummyData.length]= game;
    }
    callback(null, games);
};

/* Lets bootstrap with dummy data */
new GameProvider().save([
    {date: '2012-09-13', players:[{name:'Bob', moves:[[0,4], [0,5]]}, {name:'Dave', moves:[[2,4], [2,5]]}]},
    {date: '2012-09-12', players:[{name:'Bob', moves:[[1,4], [1,5]]}, {name:'Dave', moves:[[3,4], [3,5]]}]}
], function(error, games){});

exports.GameProvider = GameProvider;
