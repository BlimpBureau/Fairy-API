"use strict";

var authConfig = require("../auth-config.js");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var usersController = require("../users/controller.js");

module.exports = function(app) {
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

    app.post("/auth/local", passport.authenticate("local", {
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
