"use strict";

var passport = require("passport");

module.exports = function(app) {
    app.get("/auth/facebook", passport.authenticate("facebook", {
        session: false,
        scope: []
    }));

    app.get("/auth/facebook/callback", passport.authenticate("facebook", {
        session: false,
        failureRedirect: "/login"
    }), function(req, res) {
        res.send("access_token: " + req.user.accessToken);
    });
};
