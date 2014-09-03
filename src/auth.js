"use strict";

var authConfig = require("./auth-config.js");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook").Strategy;
var LocalStrategy = require("passport-local").Strategy;
var BearerStrategy = require("passport-http-bearer").Strategy;
var usersController = require("./resources/users/users-controller.js");

exports.initApp = function(app) {
    app.use(passport.initialize());
};

exports.initAccessToken = function() {
    passport.use(new BearerStrategy(function(token, done) {
        usersController.findByAccessToken(token, function(err, user) {
            if(err) {
                return done(err);
            }

            if(!user) {
                return done(null, false);
            }

            //Check so that the access token is valid.
            user.validAccessToken(token, function(valid, reason) {
                if(!valid) {
                    return done(null, false, {
                        code: reason,
                        description: "Unauthorized"
                    });
                }

                done(null, user);
            });
        });
    }));
};

exports.initFacebook = function() {
    if(!authConfig.facebook.isSet()) {
        console.error("Facebook app id, secret and callback url must be set via env variables.\n" + authConfig.facebook.getHelp());
        process.exit(1);
    }

    passport.use(new FacebookStrategy({
        clientID: authConfig.facebook.getAppID(),
        clientSecret: authConfig.facebook.getAppSecret(),
        callbackURL: authConfig.facebook.getAppCallbackUrl()
    }, function(accessToken, refreshToken, profile, done) {
        done(null, {
            accessToken: accessToken
        });
    }));
};

exports.initLocal = function() {
    passport.use(new LocalStrategy(function(username, password, done) {
        usersController.findByUsername(username, function(err, user) {
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
};
