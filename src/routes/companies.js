"use strict";

var companiesController = require("../resources/companies/companies-controller.js");
var usersController = require("../resources/users/users-controller.js");
var passport = require("passport");
var _ = require("lodash");

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
                if(err) {
                    res.status(500).send({
                        error: "internal_server_error"
                    });

                    return;
                }

                var admins = _.map(users, function(user) {
                    return {
                        id: user._id,
                        username: user.username
                    };
                });

                res.send({
                    name: company.name,
                    organisationNumber: company.organisationNumber,
                    type: company.type,
                    admins: admins
                });
            });
        });
    });
};
