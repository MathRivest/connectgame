/*
 * GET home page.
 */

exports.index = function (req, res) {
    console.log(db);
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
            games: articleProvider.findAll(function(error, docs){
                return docs;
    }) })
}
;

exports.username = function (req, res) {
    req.session.username = req.body.username;
    console.log(req.session.username);
    res.redirect('/');
};