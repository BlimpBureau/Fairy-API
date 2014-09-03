"use strict";

var authConfig = require("../auth-config.js");
var passport = require("passport");

module.exports = function(app) {
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
