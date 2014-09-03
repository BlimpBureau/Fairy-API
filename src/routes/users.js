"use strict";

var usersController = require("../users/controller.js");
var passport = require("passport");

module.exports = function(app) {
    app.post("/users", function(req, res) {
        usersController.create(req.body.username, req.body.password, function(err, user) {
            if(err) {
                if(err.code === 1 || err.code === 2) {
                    res.status(409).send(err);
                } else if(err.code === 3) {
                    res.status(400).send(err);
                } else {
                    console.error(err);
                    res.status(500).send(err);
                }

                return;
            }

            res.status(201).send({
                username: user.username
            });
        });
    });

    app.get("/users/:username", passport.authenticate("bearer", {
        session: false
    }), function(req, res) {
        if(req.user.username !== req.params.username) {
            res.status(401).send("Not aurotharized");
        }

        res.send({
            username: req.user.username
        });
    });
};
