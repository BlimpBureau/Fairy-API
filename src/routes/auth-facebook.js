"use strict";

var authConfig = require("../auth-config.js");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;

module.exports = function(app) {
    if(!authConfig.facebook.isSet()) {
        console.error("Facebook app id, secret and callback url must be set via env variables.\n" + authConfig.facebook.getHelp());
        process.exit(1);
    }

    passport.use(new FacebookStrategy({
        clientID: authConfig.facebook.getAppID(),
        clientSecret: authConfig.facebook.getAppSecret(),
        callbackURL: authConfig.facebook.getAppCallbackUrl()
    }, function(accessToken, refreshToken, profile, done) {
        console.log(accessToken, refreshToken, profile);
        done(null, {
            accessToken: accessToken
        });
    }));

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
