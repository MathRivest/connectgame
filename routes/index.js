/*
 * GET home page.
 */

var g = require('../gameprovider-mongodb').gameDB;
exports.index = function (req, res) {


    var available_games = 0;

    g.collection('games', function (err, collection) {

        games = collection.find().toArray(function (err, items) {

            items.forEach(function (game) {
                if (game.players.length < 2) {
                    available_games = available_games + 1;
                    console.log('available games is now: ' + available_games);
                }
                else {
                    console.log('l ' + game.players.length);
                }
            });

            if (available_games < 5) {
                g.collection('games', function (err, collection) {
                    for (i = available_games; i <= 5; i++) {
                        collection.insert({ date:new Date(), players:[]})
                    }
                })

            }

            if (req.session.views) {
                ++req.session.views;
            } else {
                req.session.views = 1;
            }
            if (req.session.username) {
                username = req.session.username;
            }
            else {
                username = false;
            }
            console.log(req.sessionID);

            res.render('index', {
                title:'Connect 4',
                viewed:req.session.views,
                username:username,
                games:items,
                session_id: req.sessionID
            });
        })
    });


    //console.log(g);


}
;

exports.username = function (req, res) {

    req.session.username = req.body.username;

    g.collection('games', function (err, collection) {

        req.session.hasGame = 0;

        //refactor: find the first game with nbplayers < 2 and assign to session
        collection.find().toArray(function (err, items) {
            if (0 == req.session.hasGame) {
                for (i in items) {
                    game = items[i];
                    if (game.players.length == 1) {
                        game.players.push(req.body.username);
                        collection.update({_id:game._id}, {$set:{players:game.players}});
                        req.session.hasGame = 1;
                        req.session.gameId = game._id;
                        break;

                    }


                };
            }

            if (0 == req.session.hasGame) {
                for (i in items) {
                    game = items[i];
                    if (game.players.length == 0) {

                        game.players.push(req.body.username);
                        collection.update({_id:game._id}, {$set:{players:game.players}});
                        req.session.hasGame = 1;
                        req.session.gameId = game._id;
                        break;
                    }

                };
            }
            // end refactor

            console.log('has game: ' + req.session.hasGame);

            if (game.players.length == 2) {
                res.redirect('/play');
            }
            res.redirect('/wait');

        })
    })

};
exports.play = function (req,res) {
    g.collection('games', function (err, collection) {
        collection.find().toArray(function (err, items) {

        });
    });
    if (typeof(req.session.gameId) == undefined) {
        res.redirect('/');
    }

    console.log(game.players);


}
exports.join_game = function (req, res) {
    id = req.body.id;
    console.log(id);
    res.redirect('/');
};