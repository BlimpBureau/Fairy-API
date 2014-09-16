"use strict";

var usersController = require("../resources/users/users-controller.js");
var passport = require("passport");
var utils = require("../utils-route.js");

module.exports = function(app) {
    app.post("/users", function(req, res) {
        usersController.create(req.body.firstName, req.body.lastName, req.body.email, req.body.password, function(err, user) {
            if(err) {
                if(err.code === 1 || err.code === 2) {
                    res.status(409).send({
                        error: "incorrect_client_credentials"
                    });
                } else if(err.code === 3) {
                    return utils.error.badRequest(res, {
                        details: "email_exists"
                    });
                } else {
                    console.error(err);
                    return utils.error.serverError(res);
                }

                return;
            }

            res.status(201).send(user.toObject());
        });
    });

    app.get("/users/:id", passport.authenticate("bearer", {
        session: false
    }), function(req, res) {
        if(!req.params.id) {
            return utils.error.badRequest(res);
        }

        if(req.user.id.toString() !== req.params.id) {
            return utils.error.notAuthorized(res);
        }

        res.send(req.user.toObject());
    });
};
