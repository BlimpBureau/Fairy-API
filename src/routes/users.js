"use strict";

var usersController = require("../resources/users/users-controller.js");
var passport = require("passport");

module.exports = function(app) {
    app.post("/users", function(req, res) {
        usersController.create(req.body.username, req.body.password, function(err, user) {
            if(err) {
                if(err.code === 1 || err.code === 2) {
                    res.status(409).send({
                        error: "incorrect_client_credentials"
                    });
                } else if(err.code === 3) {
                    res.status(400).send({
                        error: "username_exists"
                    });
                } else {
                    console.error(err);
                    res.status(500).send({
                        error: "internal_server_error"
                    });
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
            return res.status(400).send({
                error: "invalid_parameters"
            });
        }

        if(req.user.id.toString() !== req.params.id) {
            return res.status(401).send("Not aurotharized" + " " + req.params.id);
        }

        res.send(req.user.toObject());
    });
};
