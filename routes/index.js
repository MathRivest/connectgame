/*
 * GET home page.
 */

exports.index = function (req, res) {
    if (req.session.views) {
        ++req.session.views;
    } else {
        req.session.views = 1;
    }
    if (req.session.username)
    {
        username = req.session.username;
    }
    else
    {
        username = '';
    }
    console.log(req.session.views);
    res.render('index', { title:'Connect 4', viewed: req.session.views, username: username })
}
;

exports.username = function (req, res) {
    req.session.username = req.body.username;
    console.log(req.session.username);
    res.redirect('/');
};