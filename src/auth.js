"use strict";

var authConfig = require("./authConfig.js");

var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var LocalStrategy = require("passport-local").Strategy;

module.exports = exports = Auth;

function Auth(app) {
    this.app = app;
}

Auth.prototype.init = function() {
    this.app.use(passport.initialize());
}

Auth.prototype.useFacebook = function() {
    if(!authConfig.isFacebookSet()) {
        console.error("Facebook app id, secret and callback url must be set via env variables.\n" + authConfig.getFacebookHelp());
        process.exit(1);
    }

    passport.use(new FacebookStrategy({
        clientID: authConfig.getFacebookAppID(),
        clientSecret: authConfig.getFacebookAppSecret(),
        callbackURL: authConfig.getFacebookAppCallbackUrl()
    }, function(accessToken, refreshToken, profile, done) {
        console.log(accessToken, refreshToken, profile);
        done(null, {
            access_token: accessToken
        });
    }));

    this.app.get("/auth/facebook", passport.authenticate("facebook", {
        session: false,
        scope: []
    }));

    this.app.get("/auth/facebook/callback", passport.authenticate("facebook", {
        session: false,
        failureRedirect: "/login"
    }), function(req, res) {
        res.send("access_token: " + req.user.access_token);
    });
}

Auth.prototype.useLocal = function() {
    passport.use(new LocalStrategy(function(username, password, done) {
        console.log(username, password);
        return done(null, {
            username: username,
            password: password
        });
    }))

    this.app.post("/auth/local", passport.authenticate("local", {
        session: false
    }), function(req, res) {
        res.send({
            "access_token": "todo"
        });
    });
}
