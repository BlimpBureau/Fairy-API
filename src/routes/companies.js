"use strict";

var companiesController = require("../resources/companies/companies-controller.js");
var usersController = require("../resources/users/users-controller.js");
var passport = require("passport");
var utils = require("../utils-route.js");

module.exports = function(app) {
    app.post("/companies", passport.authenticate("bearer", {
        session: false
    }), function(req, res) {
        companiesController.create(req.body.name, req.body.organisationNumber, req.body.type, req.user.id, function(err, company) {
            if(err) {
                return utils.error.badRequest(res);
            }

            usersController.findByIds(company.admins, function(err, users) {
                if(err || users.length !== 1) {
                    console.error(err ? err : new Error("Users.length != 1"));
                    return utils.error.serverError(res);
                }

                var user = users[0];

                user.addCompany(company.id, function(err) {
                    if(err) {
                        console.error(err);
                        return utils.error.serverError(res);
                    }

                    res.status(201).send(company.toObject());
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
                console.error(err);
                return utils.error.serverError(res);
            }

            if(!company) {
                return utils.error.notFound(res);
            }

            if(!company.isUserAdmin(user._id)) {
                return utils.error.notAuthorized(res);
            }

            res.send(company.toObject());
        });
    });
};
