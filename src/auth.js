"use strict";

var authConfig = require("./auth-config.js");

var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var LocalStrategy = require("passport-local").Strategy;
var usersController = require("./users/controller.js");

module.exports = exports = Auth;

function Auth(app) {
    this.app = app;
}

Auth.prototype.init = function() {
    this.app.use(passport.initialize());
};

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
            accessToken: accessToken
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
        res.send("access_token: " + req.user.accessToken);
    });
};

Auth.prototype.useLocal = function() {
    passport.use(new LocalStrategy(function(username, password, done) {
        usersController.get(username, function(err, user) {
            if(err) {
                return done(err);
            }

            if(!user) {
                return done(null, false);
            }

            user.passwordMatches(password, function(err, isMatch) {
                if(err) {
                    return done(err);
                }

                if(!isMatch) {
                    return done(null, false);
                }

                //Password matches.
                return done(null, user);
            });
        });
    }));

    this.app.post("/auth/local", passport.authenticate("local", {
        session: false
    }), function(req, res) {
        var tokenLength = authConfig.local.getAccessTokenLength();
        var expireDays = authConfig.local.getAccessTokenExpireDays();
        req.user.generateAccessToken(tokenLength, expireDays, function(err, tokenObject) {
            if(err) {
                console.error(err);
                return res.status(500).send(err);
            }

            res.send({
                "access_token": tokenObject.token,
                "access_token_expires": tokenObject.expires
            });
        });
    });
};
