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

    app.post("/companies/:id/admins", utils.tokenRequired(), authCompany, function(req, res) {
        var companyId = req.params.id;
        var newAdminId = req.body.id;

        if(!newAdminId || !companyId) {
            return utils.error.badRequest(res);
        }

        //TODO: This should be made more robust. Bad stuff will happen second db insertion fails.
        //non-atomic db operation.

        //Check so that the id is a real user.
        usersController.findById(newAdminId, function(err, user) {
            if(err) {
                console.error(err);
                return utils.error.serverError(res);
            }

            if(!user) {
                return utils.error.badRequest(res, {
                    details: "unknown_user"
                });
            }

            user.addCompany(companyId, function(err) {
                if(err) {
                    console.error(err);
                    return utils.error.serverError(res);
                }

                req.company.addAdmin(newAdminId, function(err, company) {
                    if(err) {
                        console.error(err);
                        return utils.error.serverError(res);
                    }

                    res.status(201).send(company.toObject());
                });
            });
        });
    });
};

function authCompany(req, res, next) {
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

        req.company = company;

        next();
    });
}
