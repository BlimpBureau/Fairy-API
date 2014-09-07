"use strict";

var authConfig = require("../auth-config.js");
var passport = require("passport");
var utils = require("../utils-route.js");

module.exports = function(app) {
    app.post("/auth/local", passport.authenticate("local", {
        session: false
    }), function(req, res) {
        var tokenLength = authConfig.local.getAccessTokenLength();
        var expireDays = authConfig.local.getAccessTokenExpireDays();
        req.user.generateAccessToken(tokenLength, expireDays, function(err, tokenObject) {
            if(err) {
                console.error(err);
                return utils.error.serverError(res);
            }

            res.send({
                "user_id": req.user.id.toString(),
                "access_token": tokenObject.token,
                "access_token_expires": tokenObject.expires
            });
        });
    });
};
