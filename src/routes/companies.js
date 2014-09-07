"use strict";

var companiesController = require("../resources/companies/companies-controller.js");
var usersController = require("../resources/users/users-controller.js");
var passport = require("passport");

module.exports = function(app) {
    app.post("/companies", passport.authenticate("bearer", {
        session: false
    }), function(req, res) {
        companiesController.create(req.body.name, req.body.organisationNumber, req.body.type, req.user.id, function(err, company) {
            if(err) {
                res.status(400).send({
                    error: "invalid_parameters"
                });

                return;
            }

            usersController.findByIds(company.admins, function(err, users) {
                if(err || users.length !== 1) {
                    res.status(500).send({
                        error: "internal_server_error"
                    });

                    return;
                }

                var user = users[0];

                user.addCompany(company.id, function(err) {
                    if(err) {
                        res.status(500).send({
                            error: "internal_server_error"
                        });

                        return;
                    }

                    res.send(company.toObject());
                });
            });
        });
    });

    app.get("/companies/:id", passport.authenticate("bearer", {
        session: false
    }), function(req, res) {
        var user = req.user;

        companiesController.findById(req.params.id, function(err, company) {
            if(err) {
                return res.status(500).send({
                    error: "internal_server_error"
                });
            }

            if(!company) {
                return res.status(404).send({
                    error: "not_found"
                });
            }

            if(!company.isUserAdmin(user._id)) {
                return res.status(401).send("Not aurotharized");
            }

            res.send(company.toObject());
        });
    });
};
