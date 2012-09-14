/*
 * GET home page.
 */

exports.index = function (req, res) {
    var gameProvider= new GameProvider();

    gameProvider.findAll(function(error, docs){
        if (error)
        {
            throw error;
        }
        games = docs;
    });
    console.log(games);

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
    console.log(req.session.views);

    res.render('index', {
            title:'Connect 4',
            viewed:req.session.views,
            username:username,
            games: games
    });
}
;

exports.username = function (req, res) {
    req.session.username = req.body.username;
    console.log(req.session.username);
    res.redirect('/');
};