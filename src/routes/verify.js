"use strict";

var usersController = require("../resources/users/users-controller.js");
var utils = require("../utils-route.js");

module.exports = function(app) {
    app.post("/verify/user/:token", function(req, res) {
        var token = req.params.token;

        usersController.findByVerificationToken(token, function(err, user) {
            if(err) {
                return utils.error.serverError(res);
            }

            if(!user) {
                return utils.error.notFound(res);
            }

            user.validVerificationToken(token, function(valid) {
                if(!valid) {
                    return utils.error.notAuthorized(res, {
                        reason: "token_expired"
                    });
                }

                user.verified = true;

                user.save(function(err) {
                    if(err) {
                        return utils.error.serverError(res);
                    }

                    res.send("success");
                });
            });
        });
    });
};
